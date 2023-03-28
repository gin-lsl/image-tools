import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CombineComponent } from './combine/combine.component';

const routes: Routes = [
  {
    path: 'combine',
    component: CombineComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
