import { useContext } from "react";
import AuthContext from "./AuthContextContext";

const useAuth = () => useContext(AuthContext);

export default useAuth;

