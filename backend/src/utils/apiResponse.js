export function sendSuccess(response, data, status = 200) {
    return response.status(status).json({ success: true, data });
}
export function sendPaginated(response, data, page, limit, total) {
    return response.json({
        success: true,
        data,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
}
