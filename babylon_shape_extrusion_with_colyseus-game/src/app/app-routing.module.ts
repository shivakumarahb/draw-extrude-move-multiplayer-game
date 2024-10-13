import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameScreenComponent } from './game-screen/game-screen.component';
import { JoinScreenComponent } from './join-screen/join-screen.component';

const routes: Routes = [
  {
    path: 'room/:id',
    component: GameScreenComponent,
  },
  {
    path: '',
    component: JoinScreenComponent,
    pathMatch: 'full',
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
