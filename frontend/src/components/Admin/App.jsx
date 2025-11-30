import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar.jsx';
import './App.scss';

const AdminApp = () => {
    return (
        <div className="admin-wrapper d-flex">
            <Sidebar />
            <div className="admin-content flex-grow-1 bg-light">
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminApp;