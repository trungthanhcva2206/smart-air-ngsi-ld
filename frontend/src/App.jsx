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
 * @Copyright (C) 2024 CHK. All rights reserved
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

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Client />}>
          <Route index element={<Map />} />
          <Route path="map" element={<StationMap />} />
          <Route path="stations" element={<StationMap />} />
          <Route path="air-quality" element={<AirQuality />} />
          <Route path="open-data" element={<OpenData />} />
          <Route path="about" element={<About />} />
          <Route path="analysis" element={<Analysis />} />
        </Route>
      </Routes>
    </>
  )
}
export default App
