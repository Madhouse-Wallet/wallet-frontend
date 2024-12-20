import { AppDispatch } from '../../store';
import { setUserInfo, setSafeAddress, setUserBalance } from './authSlice';

export const userDetails = (provider: any, RPC: any, web3auth: any) => 
  async (dispatch: AppDispatch) => {
    try {
      if (!provider) {
        console.error('Provider not initialized yet');
        return;
      }

      const address = await RPC.getAccounts(provider);
      const balance = await RPC.getBalance(provider);
      const userInfo = await web3auth.getUserInfo();

      dispatch(setSafeAddress(address));
      dispatch(setUserBalance(balance));
      dispatch(setUserInfo(userInfo));
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };
