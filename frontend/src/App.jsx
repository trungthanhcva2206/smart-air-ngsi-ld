/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @Project smart-air-ngsi-ld
 * @Authors 
 *    - TT (trungthanhcva2206@gmail.com)
 *    - Tankchoi (tadzltv22082004@gmail.com)
 *    - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
*/
import {
  Routes,
  Route
} from 'react-router-dom';
import Client from './components/Client/App.jsx';
import StationMap from './components/Client/StationMap/StationMap.jsx';
import AirQuality from './components/Client/AirQuality/AirQuality.jsx';
import OpenData from './components/Client/OpenData/OpenData.jsx';
import About from './components/Client/About/About.jsx';
import Map from './components/Client/Map/Map.jsx';
import Analysis from './components/Client/Analysis/Analysis.jsx';
import StationDetail from './components/Client/StationDetail/StationDetail.jsx';
import Admin from './components/Admin/App.jsx';
import AdminDashboard from './components/Admin/Dashboard/Dashboard.jsx';
import StationManager from './components/Admin/StationManager/StationManager.jsx';
import DeviceManager from './components/Admin/DeviceManager/DeviceManager.jsx';
import AccountManager from './components/Admin/AccountManager/AccountManager.jsx';
import Login from './components/Client/Auth/Login.jsx';
import Register from './components/Client/Auth/Register.jsx';
import Profile from './components/Client/Auth/Profile.jsx';
import PrivateRoute from './components/Client/Auth/PrivateRoute.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const App = () => {
  return (
    <>
      <Routes>


        {/* Client Routes */}
        <Route path="/" element={<Client />}>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route index element={<StationMap />} />
          <Route path="/:platformId" element={<StationDetail />} />
          <Route path="map" element={<Map />} />
          <Route path="air-quality" element={<AirQuality />} />
          <Route path="open-data" element={<OpenData />} />
          <Route path="about" element={<About />} />
          <Route path="analysis" element={<Analysis />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="stations" element={<StationManager />} />
          <Route path="devices" element={<DeviceManager />} />
          <Route path="accounts" element={<AccountManager />} />
        </Route>
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}
export default App
