import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// Map locale to message file
const getMessageFile = (locale: string) => {
  switch (locale) {
    case "en":
      return "en_fixed.json";
    case "fr":
      return "fr.json";
    case "ar":
      return "ar.json";
    default:
      return "en_fixed.json";
  }
};

export default getRequestConfig(async () => {
  // Get locale from cookies, default to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

   return {
     locale,
     messages: (await import(`../../messages/${getMessageFile(locale)}`)).default,
   };
});
