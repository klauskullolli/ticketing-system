import { useLocation, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { FirstServer } from "../services/firstServerService";


const RequireAuth = ({ roles }) => {
    const location = useLocation();
    const navigator = useNavigate();
    const loginUser = secureLocalStorage.getItem('loginUser');

    useEffect(() => {
        const check = async () => {
            try {
                const firstServerService = new FirstServer(loginUser?.token);
                await firstServerService.getAuth(firstServerService?.token);
            } catch (err) {
                console.error(err);
                secureLocalStorage.removeItem('loginUser');
                navigator('/login', { state: { from: location } });
            }
        }
        check();

    }, []);


    if (!loginUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (roles && !roles.map(role => role.toLowerCase()).includes(loginUser?.role.toLowerCase())) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return <Outlet />;

}

export default RequireAuth; 