export default (req: any, res: any, next: any) => {
    const token = (req.headers.authorization || "").toLowerCase().replace("bearer ", "");

    req.auth = {
        isAuthenticated: token !== "",
        token,
    };

    next();
};
