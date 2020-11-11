module.exports = {
    apps: [
        {
            name: "Fischl",
            script: "ts-node",
            interpreter: `${process.env.NVM_BIN}/node`,
            args: "-r tsconfig-paths/register ./src/index.ts",
            instances: 1,
            autorestart: true,
            watch: false,
            exec_mode: "fork",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
};
