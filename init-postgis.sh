# This script provisions ALL virtual devices for Hanoi districts
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 
# @Project smart-air-ngsi-ld
# @Authors 
#    - TT (trungthanhcva2206@gmail.com)
#    - Tankchoi (tadzltv22082004@gmail.com)
#    - Panh (panh812004.apn@gmail.com)
# @Copyright (C) 2025 CHK. All rights reserved
# @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
#!/bin/bash
set -e

# Initialize PostGIS extension for QuantumLeap
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create PostGIS extension
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS postgis_topology;
    
    -- Grant permissions
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $POSTGRES_USER;
    
    -- Log success
    SELECT 'PostGIS extension installed successfully' AS status;
EOSQL

echo "PostGIS initialization complete!"

