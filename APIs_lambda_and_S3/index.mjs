import AWS from 'aws-sdk';

const s3 = new AWS.S3();

const bucketName = process.env.S3_BUCKET_NAME || 'shivajsonbucket';
const maxItemsToRetrieve = parseInt(process.env.MAX_ITEMS_TO_RETRIEVE, 10) || 100;

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Correctly extract the HTTP method from the event object
    const httpMethod = event.requestContext?.http?.method;

    console.log('Detected HTTP method:', httpMethod);

    try {
        if (httpMethod === 'POST') {
            return await handlePostRequest(event);
        } else if (httpMethod === 'GET') {
            return await handleGetRequest();
        } else {
            console.error('Unsupported or undetected HTTP method:', httpMethod);
            return createResponse(400, { error: 'Unsupported or undetected HTTP method' });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        return createResponse(500, { error: 'Internal server error', details: error.message });
    }
};

async function handlePostRequest(event) {
    console.log('Handling POST request');
    
    try {
        // Check if body exists
        if (!event.body) {
            return createResponse(400, { error: 'Missing request body' });
        }

        let body;
        try {
            body = JSON.parse(event.body);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return createResponse(400, { error: 'Invalid JSON in request body' });
        }

        console.log('Parsed body:', body);

        const fileName = `data/${Date.now()}.json`;
        console.log('File name for S3:', fileName);

        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: JSON.stringify(body),
            ContentType: 'application/json',
        };

        console.log('S3 putObject params:', params);

        try {
            const data = await s3.putObject(params).promise();
            console.log('S3 PutObject response:', data);

            return createResponse(200, {
                message: 'File uploaded successfully',
                e_tag: data.ETag,
                url: `https://${bucketName}.s3.amazonaws.com/${fileName}`,
            });
        } catch (error) {
            console.error('Error uploading to S3:', error);
            if (error.code === 'NoSuchBucket') {
                return createResponse(500, { error: 'S3 bucket does not exist' });
            } else if (error.code === 'AccessDenied') {
                return createResponse(500, { error: 'Access denied to S3 bucket' });
            } else {
                return createResponse(500, { error: 'Failed to upload file to S3', details: error.message });
            }
        }
    } catch (error) {
        console.error('Error in handlePostRequest:', error);
        return createResponse(500, { error: 'Internal server error', details: error.message });
    }
}

async function handleGetRequest() {
    console.log('Handling GET request');

    const params = {
        Bucket: bucketName,
        Prefix: 'data/',
        MaxKeys: maxItemsToRetrieve,
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        console.log('S3 ListObjects response:', data);

        if (!data.Contents || data.Contents.length === 0) {
            return createResponse(200, []);
        }

        const jsonData = await Promise.all(data.Contents.map(async (obj) => {
            try {
                const fileData = await s3.getObject({
                    Bucket: bucketName,
                    Key: obj.Key,
                }).promise();
                return JSON.parse(fileData.Body.toString('utf-8'));
            } catch (error) {
                console.error(`Error processing object ${obj.Key}:`, error);
                return null; // Skip this object if there's an error
            }
        }));

        // Filter out any null values from errors
        const validJsonData = jsonData.filter(item => item !== null);

        return createResponse(200, validJsonData);
    } catch (error) {
        console.error('Error retrieving data from S3:', error);
        if (error.code === 'NoSuchBucket') {
            return createResponse(500, { error: 'S3 bucket does not exist' });
        } else if (error.code === 'AccessDenied') {
            return createResponse(500, { error: 'Access denied to S3 bucket' });
        } else {
            return createResponse(500, { error: 'Failed to retrieve data from S3', details: error.message });
        }
    }
}

function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', 
        },
        body: JSON.stringify(body),
    };
}
