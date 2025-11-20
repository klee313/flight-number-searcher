import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { t } from '../../data/locales';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useUIStore } from '../../stores/useUIStore';

export default function SettingsModal() {
    const { apiKey, setApiKey } = useSettingsStore();
    const { isSettingsOpen, closeSettings } = useUIStore();
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

    return (
        <Modal isOpen={isSettingsOpen} onClose={closeSettings} title={t('settingsTitle')}>
            <div className="setting-group">
                <label htmlFor="apiKey">{t('apiKeyLabel')}</label>
                {!apiKey ? (
                    <div id="apiKeyInputArea">
                        <div className="row">
                            <input
                                id="apiKey"
                                type="text"
                                placeholder={t('apiKeyPlaceholder')}
                                value={keyInput}
                                onChange={(e) => setKeyInput(e.target.value)}
                            />
                            <button id="saveKey" className="btn" onClick={handleSaveKey}>{t('saveBtn')}</button>
                        </div>
                        <p className="help" dangerouslySetInnerHTML={{ __html: t('apiKeyHelp') }}></p>
                    </div>
                ) : (
                    <div id="apiKeySavedArea">
                        <div className="row">
                            <div id="keyStatus" className="chip" style={{
                                borderColor: 'rgba(46,196,182,.35)',
                                background: 'rgba(46,196,182,.1)',
                                color: 'var(--ok)'
                            }}>
                                {t('statusActive')}
                            </div>
                            <button id="clearKey" className="btn secondary" title="Clear saved key" onClick={handleClearKey}>
                                {t('clearBtn')}
                            </button>
                        </div>
                        <p className="help" dangerouslySetInnerHTML={{ __html: t('apiKeySavedHelp') }}></p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
