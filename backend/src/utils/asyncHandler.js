export function asyncHandler(controller) {
    return (request, response, next) => {
        void controller(request, response, next).catch(next);
    };
}
