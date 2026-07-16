import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Lock } from "lucide-react";
import { API_URL } from '../../../config/api';

const ChangePassword = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) navigate("/login");
    }, [token, navigate]);

    if (!token) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newPassword || !confirmPassword) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        if (newPassword.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                `${API_URL}/auth/change-password`,
                { newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            localStorage.setItem("token", res.data.access_token);

            setSuccess("Mot de passe mis à jour avec succès 🎉");

            setTimeout(() => {
                navigate("/"); // 🔥 container décide
            }, 1200);
        } catch {
            setError("Erreur lors de la mise à jour du mot de passe");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-[#4361ee]/10 flex items-center justify-center mb-3">
                        <Lock className="text-[#4361ee]" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-800">
                        Changement de mot de passe
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Pour des raisons de sécurité, veuillez définir un nouveau mot de passe
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                        {success}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 pr-10 rounded-lg border-[1.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
                                placeholder="Minimum 8 caractères"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border-[1.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
                            placeholder="Répétez le mot de passe"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#4361ee] hover:bg-[#3a56d4] text-white py-2.5 rounded-lg font-semibold disabled:opacity-60 transition-transform transform hover:-translate-y-0.5"
                    >
                        {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-400">
                    © 2025 SETICE — Sécurité & confidentialité
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
