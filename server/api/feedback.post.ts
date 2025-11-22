export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    const {
        contact,
        description,
        locale,
        nickname,
    } = body;

    if (!description) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Description is required',
        });
    }

    if (!config.telegramBotToken || !config.telegramChatId) {
        console.error('Telegram configuration missing');
        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error',
        });
    }

    const message = `
📦 *收到新意見回饋*

👤 *暱稱:* ${nickname || '匿名'}
📞 *聯絡方式:* ${contact || '未提供'}
🌐 *語系:* ${locale || '未知'}

📝 *內容:*
${description}
  `;

    try {
        await $fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
            body: {
                chat_id: config.telegramChatId,
                parse_mode: 'Markdown',
                text: message,
            },
            method: 'POST',
        });

        return { success: true };
    } catch (error) {
        console.error('Telegram API Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to send feedback',
        });
    }
});
