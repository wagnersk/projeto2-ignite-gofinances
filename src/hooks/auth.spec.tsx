import 'jest-fetch-mock'

import { renderHook, act } from '@testing-library/react-hooks';
import { mocked } from 'ts-jest/utils';
import { AuthProvider, useAuth } from './auth';
import { startAsync } from 'expo-auth-session';
import fetchMock from 'jest-fetch-mock';


jest.mock('expo-auth-session');


fetchMock.enableMocks();


describe('Auth Hook',()=>{
    it('should be able to sign in with Google account existing', async () => {
    
      //Primeiro, nós precisamos do Token. Então, vamos Mockar a função de startAsync.
      const googleMocked = mocked(startAsync as any);
      googleMocked.mockReturnValueOnce({
        type: 'success',
        params: {
          access_token: 'any_token',
        }
      });

      
      //Agora que temos o Token, vamos mockar a requisição http dos dados de profile do usuário.
      fetchMock.mockResponseOnce(JSON.stringify(
        {
          id: 'any_id',
          email: 'rodrigo.goncalves@rocketseat.team',
          name: 'Rodrigo',
          photo: 'any_photo.png'
        } 
      ));

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(async () => await result.current.signInWithGoogle());
      await waitForNextUpdate();
    
      
      expect(result.current.user.email)
      .toBe('rodrigo.goncalves@rocketseat.team');
    });


  it('user should not connect if cancel authentication with Google', async () => {

          const googleMocked = mocked(startAsync as any);
          googleMocked.mockReturnValueOnce({
          type: 'cancel'
          });
  

          const { result } = renderHook(()=> useAuth(),{
              wrapper:AuthProvider
          })

          await act(()=>result.current.signInWithGoogle())


          expect(result.current.user).not.toHaveProperty('id')


    })


  it('should be error with incorrectly Google parameters', async () => {

    const { result } = renderHook(()=> useAuth(),{
        wrapper:AuthProvider
    })

      try{
            await act(()=>result.current.signInWithGoogle())
      }catch{
            expect(result.current.user).toEqual({})
      }

  })
})