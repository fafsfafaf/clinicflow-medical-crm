import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="flex items-center gap-3 mb-8">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
            </div>

            <div className="prose prose-slate">
                <p className="text-lg text-slate-600 mb-6">
                    Effective Date: {new Date().toLocaleDateString()}
                </p>

                <h3>1. Information We Collect</h3>
                <p>
                    We collect information you provide directly to us, such as when you create an account, connect your Google Calendar, or communicate with us.
                    This includes your email address, calendar events, and profile information.
                </p>

                <h3>2. How We Use Your Information</h3>
                <p>
                    We use the information we collect to operate, maintain, and improve our services, such as syncing your Google Calendar appointments with our dashboard.
                    We do not sell your personal data to third parties.
                </p>

                <h3>3. Google User Data</h3>
                <p>
                    Our application accesses your Google Calendar data to provide synchronization features. This data is stored securely and is only used to display and manage your appointments within the application.
                </p>

                <h3>4. Contact</h3>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at support@clinicflow.local.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPage;
