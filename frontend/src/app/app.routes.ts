import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public/public';
import { Home } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { AdminLayout } from './layout/admin/admin';
import { FileListComponent } from './pages/files/file-list/file-list';
import { authGuard } from './_helpers/auth-guard';
import { FileUploadComponent } from './pages/files/file-upload/file-upload';
import { FileDetailsComponent } from './pages/files/file-details/file-details';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', component: Home },
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'files/upload', component: FileUploadComponent, canActivate: [authGuard] },
            { path: 'file/:id', component: FileDetailsComponent },
        ]
    },
    {
        path: 'files',
        component: AdminLayout,
        children: [
            { path: '', component: FileListComponent, canActivate: [authGuard] }
        ]
    }
];
