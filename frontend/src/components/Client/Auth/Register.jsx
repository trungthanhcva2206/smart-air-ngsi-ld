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
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { registerUser, clearError } from '../../../store/slices/authSlice';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { toast } from 'react-toastify';
import './Auth.scss';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const password = watch('password');

    const getPasswordStrength = (pwd) => {
        if (!pwd) return '';
        if (pwd.length < 6) return 'weak';
        if (pwd.length < 10) return 'medium';
        return 'strong';
    };

    const onSubmit = async (data) => {
        dispatch(clearError());
        const { confirmPassword, ...userData } = data;
        const result = await dispatch(registerUser({
            ...userData,
            notificationEnabled: true,
            districts: []
        }));
        if (registerUser.fulfilled.match(result)) {
            toast.success('Đăng ký thành công!');
            navigate('/profile');
        } else {
            toast.error(result.payload || 'Đăng ký thất bại');
        }
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Đăng ký</h2>
                <p className="auth-subtitle">Tạo tài khoản mới để theo dõi chất lượng không khí</p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    {/* Full Name */}
                    <div className="form-group">
                        <label htmlFor="fullName">Họ và tên</label>
                        <input
                            type="text"
                            id="fullName"
                            className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                            placeholder="Nguyễn Văn A"
                            {...register('fullName', {
                                required: 'Họ và tên là bắt buộc',
                                minLength: {
                                    value: 3,
                                    message: 'Họ và tên phải có ít nhất 3 ký tự'
                                }
                            })}
                        />
                        {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="example@email.com"
                            {...register('email', {
                                required: 'Email là bắt buộc',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Email không hợp lệ'
                                }
                            })}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                placeholder="••••••••"
                                {...register('password', {
                                    required: 'Mật khẩu là bắt buộc',
                                    minLength: {
                                        value: 6,
                                        message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                    }
                                })}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <BsEyeSlash /> : <BsEye />}
                            </button>
                        </div>
                        {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className={`password-strength ${passwordStrength}`}>
                                <div className="strength-bar"></div>
                                <span className="strength-text">
                                    {passwordStrength === 'weak' && 'Yếu'}
                                    {passwordStrength === 'medium' && 'Trung bình'}
                                    {passwordStrength === 'strong' && 'Mạnh'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                placeholder="••••••••"
                                {...register('confirmPassword', {
                                    required: 'Vui lòng xác nhận mật khẩu',
                                    validate: (value) => value === password || 'Mật khẩu không khớp'
                                })}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword.message}</div>}
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
