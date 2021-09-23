import * as React from 'react'
import * as Limits from '../conf/Limits'
import {Type} from '../ModalContentHost'
import Button from './Button'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import SIGN_IN_IMAGE from '!!raw-loader!./sign-in.svg'
import styles from './signIn.css'
import NewGame from './NewGame'

const SignIn: ModalContentComponent = Object.assign(function SignIn(props: IModalContentComponentProps) {
  const signInRequired = props.totalStartedGames >= Limits.UNAUTHENTICATED_GAMES_LIMIT
  const onContinue = React.useMemo(
    () => () => {
      props.onShowContent(NewGame, false)
    },
    [props.onShowContent],
  )

  return (
    <div className={styles.signIn}>
      <div className={styles.illustration} onClick={props.onSignIn}>
        <img className={styles.illustrationImage} src={`data:image/svg+xml;base64,${btoa(SIGN_IN_IMAGE)}`} alt=''/>
      </div>
      {signInRequired ?
        <p className={styles.text}>
          Dosáhli jste maximálního počtu her pro nepřihlášeného hráče. Pokud chcete hrát dále, je nutné se přihlásit.
        </p>
      :
        <p className={styles.text}>
          Blížíte se maximálnímu počtu her pro nepřihlášeného hráče. Pokud chcete hrát dále, bude nutné se přihlásit.
        </p>
      }
      <div className={styles.buttons}>
        {signInRequired ?
          <Button onClick={props.onExitApp}>
            Opustit hru
          </Button>
        :
          <Button onClick={onContinue}>
            Pokračovat
          </Button>
        }
        <Button onClick={props.onSignIn}>
          Přihlásit se
        </Button>
      </div>
    </div>
  )
}, {
  title: '',
  type: Type.FLOATING,
})

export default SignIn
