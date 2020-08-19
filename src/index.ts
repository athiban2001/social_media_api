import { ApolloServer } from "apollo-server-express";
import cookieSession from "cookie-session";
import cors from "cors";
import Express, { Request, Response } from "express";
import { graphqlUploadExpress } from "graphql-upload";
import http from "http";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { createSchema } from "./graphql/createSchema";
import { userImageRouter } from "./routers/userImageRouter";

(async () => {
    await createConnection();

    const schema = await createSchema();

    const app = Express();
    const apolloServer = new ApolloServer({
        schema,
        uploads: false,
        context: ({
            req,
            res,
            connection,
        }: {
            req: Request;
            res: Response;
            connection: any;
        }) => ({
            req,
            res,
            connection,
        }),
        subscriptions: {
            path: "/subscriptions",
            onConnect: (_, ws: any) => {
                return new Promise((res) => {
                    sessionMiddleware(ws.upgradeReq, {} as any, () => {
                        if (!ws.upgradeReq.session.userId) {
                            throw new Error("Not authenticated");
                        }

                        res({ session: ws.upgradeReq.session });
                    });
                });
            },
        },
    });

    app.set("trust proxy", 1);
    app.use(
        cors({
            credentials: true,
            origin: "http://localhost:3000",
        })
    );

    const sessionMiddleware = cookieSession({
        name: "session",
        keys: ["keys1", "keys2"],
        maxAge: 60 * 60 * 24 * 7,
    });

    app.use(sessionMiddleware);
    app.use(userImageRouter);
    app.use(graphqlUploadExpress({ maxFileSize: 1024 * 1024, maxFiles: 1 }));

    apolloServer.applyMiddleware({ app, cors: true });
    const httpServer = http.createServer(app);
    apolloServer.installSubscriptionHandlers(httpServer);

    httpServer.listen(3000, () => {
        console.log(
            "Server is up and running on http://localhost:3000/graphql"
        );
        console.log(
            `Subscriptions server is on ${apolloServer.subscriptionsPath}`
        );
    });
})();
