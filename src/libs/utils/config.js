const environments = {
  PROD: {
    BACKEND_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  QA: {
    BACKEND_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  DEV: {
    BACKEND_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

// "PROD" | "QA" | "DEV"
export const ENV = process.env.NEXT_PUBLIC_ENVIRONMENT;

export const config = {
  backend_url: environments[ENV].BACKEND_URL,
};
