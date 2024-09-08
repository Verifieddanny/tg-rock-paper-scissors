import  {createThirdwebClient} from "thirdweb";

const clientID = import.meta.env.VITE_TEMPLATE_CLIENT_ID;

export const client = createThirdwebClient({
    clientId: clientID,
})