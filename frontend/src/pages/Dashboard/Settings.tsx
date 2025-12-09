import { Card, CardHeader } from "@/components/UI";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">{t('common.settings')}</h1>
            <Card>
                <CardHeader title="General Settings" description="Manage your account preferences" />
                <div className="p-4 text-slate-500">
                    Settings functionality is coming soon.
                </div>
            </Card>

            <Card>
                <CardHeader title="Notifications" description="Configure how you receive alerts" />
                <div className="p-4 text-slate-500">
                    Notification settings are coming soon.
                </div>
            </Card>
        </div>
    );
}
