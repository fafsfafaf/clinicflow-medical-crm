import React from 'react';
import { ScrollText } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="flex items-center gap-3 mb-8">
                <ScrollText className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
            </div>

            <div className="prose prose-slate">
                <p className="text-lg text-slate-600 mb-6">
                    Last Updated: {new Date().toLocaleDateString()}
                </p>

                <h3>1. Acceptance of Terms</h3>
                <p>
                    By accessing and using ClinicFlow ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>

                <h3>2. Description of Service</h3>
                <p>
                    ClinicFlow provides a medical CRM dashboard that integrates with third-party services, including Google Calendar, to help manage patient appointments and clinic workflows.
                </p>

                <h3>3. Google Calendar Integration</h3>
                <p>
                    Our Service allows you to connect your Google Calendar account. By doing so, you grant us permission to access, create, update, and delete events on your behalf as described in our Privacy Policy. You typically retain ownership of your data, and we only process it to provide the requested services.
                </p>

                <h3>4. User Responsibilities</h3>
                <p>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the Service for any illegal or unauthorized purpose.
                </p>

                <h3>5. Termination</h3>
                <p>
                    We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>

                <h3>6. Contact Us</h3>
                <p>
                    If you have any questions about these Terms, please contact us at support@clinicflow.local.
                </p>
            </div>
        </div>
    );
};

export default TermsPage;
