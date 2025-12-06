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
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */

import { BsChevronRight } from 'react-icons/bs';
import './Breadcrumb.scss';

/**
 * Breadcrumb component
 * @param {Array} items - Mảng các breadcrumb items
 * @example
 * <Breadcrumb items={[
 *   { label: 'Bản đồ trạm', link: '/map' },
 *   { label: 'Phường Hoàn Kiếm' }
 * ]} />
 */
const Breadcrumb = ({ items = [] }) => {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="breadcrumb" className="breadcrumb-nav">
            <ol className="breadcrumb">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li 
                            key={index} 
                            className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                            aria-current={isLast ? 'page' : undefined}
                        >
                            {!isLast && item.link ? (
                                <>
                                    <a href={item.link} className="breadcrumb-link">
                                        {item.label}
                                    </a>
                                    <BsChevronRight className="breadcrumb-separator" />
                                </>
                            ) : !isLast ? (
                                <>
                                    <span className="breadcrumb-link">
                                        {item.label}
                                    </span>
                                    <BsChevronRight className="breadcrumb-separator" />
                                </>
                            ) : (
                                <span className="breadcrumb-current">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
