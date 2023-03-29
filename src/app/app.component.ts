import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'image-tools';

  sidenavOpened = false;

  @ViewChild(MatDrawer, { static: true })
  drawer!: MatDrawer;

  routes = [
    {
      path: '',
      title: 'Home',
    },
    {
      path: 'combine',
      title: 'Combine',
    },
  ];
}
