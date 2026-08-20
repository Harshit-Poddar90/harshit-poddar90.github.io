/**
 * Contact form → Formspree, submitted with fetch so the visitor never leaves
 * the page. Every branch resets the button, and the status line is a live
 * region so screen readers announce the result.
 */
import { $ } from './config.js';

const IDLE_LABEL = 'Send message';

export function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const label  = $('.btn-text', form);
    const status = $('#form-status');
    const submit = $('button[type="submit"]', form);

    const setStatus = (text, kind) => {
        if (!status) return;
        status.textContent = text;
        status.classList.toggle('is-ok', kind === 'ok');
        status.classList.toggle('is-error', kind === 'error');
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (submit) submit.disabled = true;
        if (label) label.textContent = 'Sending…';
        setStatus('', null);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });

            if (response.ok) {
                form.reset();
                setStatus('Thanks — message sent. I usually reply within a day.', 'ok');
            } else {
                const data = await response.json().catch(() => ({}));
                const detail = data?.errors?.[0]?.message;
                setStatus(detail || 'That did not go through. Email harshit10233@gmail.com instead?', 'error');
            }
        } catch {
            setStatus('Network error. Email harshit10233@gmail.com instead?', 'error');
        } finally {
            if (submit) submit.disabled = false;
            if (label) label.textContent = IDLE_LABEL;
        }
    });
}
