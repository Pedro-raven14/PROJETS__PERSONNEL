import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { API_URL } from '../../../config/api';

type LoginProps = {
    setToken: (t: string) => void;
};

const Login = ({ setToken }: LoginProps) => {
    const [email, setName] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });
            const token = res.data.access_token;
            setToken(token);
            // Persist the user object returned by the backend so the UI can show names
            try {
                if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
            } catch (e) { }

            const user: any = jwtDecode(token);
            // Conserver la logique frontend: routes par rôle
            if (user.role === "directeur") navigate("/directeur");
            else if (user.role === "formateur") navigate("/formateur");
            else navigate("/etudiant");
        } catch (err) {
            setError("Identifiants ou mot de passe invalide");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate("/directeur");
        }, 1000);
    };

    const handleGithubLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate("/directeur");
        }, 1000);
    };

    return (
        <div className="connexion-container min-h-screen bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:min-h-screen">
                {/* Left - form section */}
                <div className="form-section w-full lg:w-1/2 flex items-center justify-center p-6">
                    <div className="form-wrapper w-full max-w-112.5 bg-white rounded-xl shadow-lg p-4 border border-[#e9ecef]">
                        <div className="text-center mb-4">
                            <h1 className="app-title text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-[#4361ee] to-[#4cc9f0]">
                                SETICE
                            </h1>
                            <p className="app-subtitle text-gray-600 mt-2">Connectez-vous à votre espace de travail</p>
                        </div>

                        {error && (
                            <div className="mb-4 text-center text-[#dc3545] font-medium">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Adresse email</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#e9ecef] bg-white focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
                                    placeholder="votre@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#e9ecef] bg-white focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
                                    placeholder="Votre mot de passe"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center text-sm">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="mr-2 h-4 w-4 text-[#4361ee] bg-white border-[#e9ecef] rounded"
                                    />
                                    Se souvenir de moi
                                </label>
                                <a className="forgot-password-link text-sm text-[#4361ee]">Mot de passe oublié ?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full login-btn bg-[#4361ee] hover:bg-[#3a56d4] text-white py-2.5 rounded-lg font-semibold disabled:opacity-60 transition-transform transform hover:-translate-y-0.5"
                            >
                                {isLoading ? "Connexion..." : "Se connecter"}
                            </button>

                            <div className="divider flex items-center my-4 text-gray-600">
                                <hr className="flex-1 h-px bg-[#e9ecef] border-0" />
                                <span className="px-4 text-sm">Ou connectez-vous avec</span>
                                <hr className="flex-1 h-px bg-[#e9ecef] border-0" />
                            </div>
                            <div className="social-login flex gap-2">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="social-btn flex-1 py-2.5 rounded-lg border-[1.5px] bg-white hover:shadow-md  hover:-translate-y-0.5 transition flex items-center justify-center gap-2 font-semibold border-[#ddd] text-[#212529]"
                                >
                                    <FcGoogle className="text-xl" />
                                    <span>Google</span>
                                </button>
                                <button
                                    onClick={handleGithubLogin}
                                    disabled={isLoading}
                                    className="social-btn flex-1 py-2.5 rounded-lg border-[1.5px] bg-white hover:shadow-md hover:-translate-y-0.5 transition flex items-center justify-center gap-2 font-semibold border-[#333] text-[#212529]"
                                >
                                    <FaGithub className="text-lg" />
                                    <span>GitHub</span>
                                </button>
                            </div>

                            <div className="mt-4 text-center footer-info text-sm text-[#6c757d]">
                                <p>© 2025 SETICE. Tous droits réservés.</p>
                                <div className="footer-links flex items-center justify-center gap-2 text-[#6c757d] mt-2">
                                    <a className="hover:underline">Confidentialité</a>
                                    <span>•</span>
                                    <a className="hover:underline">Conditions d'utilisation</a>
                                    <span>•</span>
                                    <a className="hover:underline">Aide</a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right - illustration */}
                <div className="illustration-section hidden lg:block w-full lg:w-1/2 relative">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
                        }}
                    />
                    <div className="illustration-overlay absolute inset-0 bg-linear-to-br from-[#4361ee]/85 to-[#4cc9f0]/85 flex items-end p-10">
                        <div className="illustration-content max-w-xl text-white">
                            <h2 className="illustration-title text-2xl md:text-3xl font-bold mb-4">Collaboration d'équipe optimisée</h2>
                            <p className="illustration-subtitle text-base opacity-90">Rejoignez des milliers d'équipes qui améliorent leur productivité avec SETICE</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;