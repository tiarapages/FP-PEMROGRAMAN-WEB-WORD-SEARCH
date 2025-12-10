module.exports = {
  apps: [
    {
      name: "fp-fe-development",
      script: "dotenv -e .env.development -- npm run dev",
      cdw: "/root/FP-PemrogramanWebsite-FE-2025/development",
      env_file: ".env.development",
      shutdown_with_message: true,
    },
    {
      name: "fp-fe-production",
      script: "dotenv -e .env.production -- npm run preview",
      cdw: "/root/FP-PemrogramanWebsite-FE-2025/production",
      env_file: ".env.production",
      shutdown_with_message: true,
    },
  ],
};
