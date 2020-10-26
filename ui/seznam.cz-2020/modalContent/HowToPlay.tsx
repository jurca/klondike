import * as React from 'react'
import {Type} from '../ModalContentHost'
import styles from './howToPlay.css'
import ModalContentComponent, {IModalContentComponentProps} from './ModalContentComponent'
import ModalContentWithBottomCloseButton from './ModalContentWithBottomCloseButton'

const HowToPlay: ModalContentComponent = Object.assign(function HowToPlayUI(props: IModalContentComponentProps) {
  return (
    <ModalContentWithBottomCloseButton {...props}>
      <div className={styles.howToPlay}>
        <p>
          Cílem hry je přesouváním karet z&nbsp;tahacího balíčku a herních sloupců vytvořit v&nbsp;odkládacích balíčkách
          čtyři postupky tvořené kartami stejné barvy seřazenými vzestupně od Esa (A) po Krále (K).
        </p>
        <h2>
          Rozložení karet na hrací ploše
        </h2>
        <h3>
          Tahací balíček (vlevo nahoře)
        </h3>
        <p>
          Podle toho, jakou jste na začátku hry zvolili obtížnost, si z&nbsp;něj kliknutím odkryjete jednu nebo tři
          karty. Horní odkrytou kartu můžete přesunout do jiné části herní plochy nebo ji ponechat v&nbsp;tahacím
          balíčku. Dokud v&nbsp;něm zbývají nepoužité karty, lze balíček procházet opakovaně.
        </p>
        <h3>
          Odkládací balíčky (vpravo nahoře)
        </h3>
        <p>
          Do odkládacích balíčků přesuňte odkrytá Esa a na každé z&nbsp;nich postupně další karty stejné barvy seřazené
          postupně podle hodnoty od nejnižších po nejvyšší (A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K). Horní kartu
          z&nbsp;každého odkládacího balíčku můžete vzít a umístit do některého herního sloupce.
        </p>
        <h3>
          Herní sloupce
        </h3>
        <p>
          Každý herní sloupec má na začátku hry odkrytou jednu kartu. Na odkryté karty umisťujte z&nbsp;tahacího balíčku
          nebo z&nbsp;jiných herních sloupců karty s hodnotou o jedna menší a s&nbsp;opačnou barvou (např. na červenou
          osmičku můžete umístit pouze černou sedmičku). Odkryté karty lze mezi sloupci přemisťovat po jedné i po
          skupinách, skupiny seřazených karet je možné rozpojovat. Když ze sloupce odeberete poslední odkrytou kartu,
          automaticky se odkryje karta pod ní. Pokud všechny karty ze sloupce přesunete jinam, můžete na jeho místo
          umístit Krále nebo skupinu karet, jejíž nejvyšší kartou je Král.
        </p>
      </div>
    </ModalContentWithBottomCloseButton>
  )
}, {
  title: 'Jak hrát Solitaire',
  type: Type.DRAWER,
})

export default HowToPlay
