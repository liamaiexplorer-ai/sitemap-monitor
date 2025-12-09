import { Card, CardHeader } from "@/components/UI";
import { useTranslation } from "react-i18next";

export default function SitemapsPage() {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">{t('common.sitemaps')}</h1>
            <Card>
                <CardHeader title="All Sitemaps" description="View and manage all your tracked sitemaps" />
                <div className="p-8 text-center text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                    Sitemap management view is under construction.
                </div>
            </Card>
        </div>
    );
}
