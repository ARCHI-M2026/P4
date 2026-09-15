import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public/public';
import { Home } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', component: Home },
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent }
        ]
    }
];
