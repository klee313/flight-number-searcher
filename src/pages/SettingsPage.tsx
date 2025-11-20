import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { apiKey, setApiKey } = useSettingsStore();
    const [keyInput, setKeyInput] = useState(apiKey || '');

    useEffect(() => {
        setKeyInput(apiKey || '');
    }, [apiKey]);

    const handleSaveKey = () => {
        if (!keyInput.trim()) {
            alert(t('alertNoKey'));
            return;
        }
        setApiKey(keyInput.trim());
    };

    const handleClearKey = () => {
        setApiKey('');
        setKeyInput('');
    };

    const changeLanguage = (value: string) => {
        i18n.changeLanguage(value);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('settingsTitle')}</CardTitle>
                    <CardDescription>{t('settingsDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Language Settings */}
                    <div className="space-y-2">
                        <Label htmlFor="language">{t('languageLabel')}</Label>
                        <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('selectLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">{t('langEn')}</SelectItem>
                                <SelectItem value="ko">{t('langKo')}</SelectItem>
                                <SelectItem value="tr">{t('langTr')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* API Key Settings */}
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">{t('apiKeyLabel')}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="apiKey"
                                type="text"
                                placeholder={t('apiKeyPlaceholder')}
                                value={keyInput}
                                onChange={(e) => setKeyInput(e.target.value)}
                                className="flex-1"
                                disabled={!!apiKey}
                            />
                            {!apiKey ? (
                                <Button onClick={handleSaveKey}>{t('saveBtn')}</Button>
                            ) : (
                                <Button variant="destructive" onClick={handleClearKey}>{t('clearBtn')}</Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{
                            __html: apiKey ? t('apiKeySavedHelp') : t('apiKeyHelp')
                        }} />
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
