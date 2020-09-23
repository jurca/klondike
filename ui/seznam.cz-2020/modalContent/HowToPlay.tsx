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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus at vestibulum ligula. Suspendisse vitae
          tincidunt sem. Aenean pharetra neque at nunc commodo consectetur. Pellentesque habitant morbi tristique
          senectus et netus et malesuada fames ac turpis egestas. Nulla condimentum ante eget augue tincidunt, vitae
          posuere magna rutrum. Aliquam ac mollis sem. Donec sed molestie quam. Vestibulum et sollicitudin augue. Etiam
          sit amet posuere nunc. Donec malesuada a eros et ultricies. Donec id faucibus est, id viverra dui. Fusce
          mattis nibh sed imperdiet euismod. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per
          inceptos himenaeos. Sed mollis varius lobortis. Fusce viverra interdum egestas. Donec sollicitudin id arcu in
          dictum.
        </p>
        <p>
          Praesent auctor bibendum elit, id pharetra lorem rhoncus in. Fusce id dignissim ante, sit amet semper orci.
          Nulla convallis vitae nibh a fermentum. Nam sit amet iaculis velit, quis mattis ligula. Aenean eget magna
          sapien. Vivamus eget ex sollicitudin, condimentum sem eu, condimentum arcu. Mauris tellus nulla, molestie eu
          rutrum ut, blandit semper dui. Morbi nec neque id dolor accumsan pulvinar. Donec quis erat sit amet ligula
          eleifend suscipit eget vel nisl. Sed porta varius metus, vel rutrum risus. Vestibulum id finibus ligula, eget
          tempor metus. Vivamus vitae pretium augue, facilisis tempor risus. Cras ut nulla est.
        </p>
        <p>
          Nulla est mi, vulputate sit amet molestie eget, dapibus sed elit. Phasellus laoreet laoreet nulla id rhoncus.
          Pellentesque quis nibh et turpis volutpat rhoncus vel ut mauris. Fusce semper diam quis nunc fringilla
          rhoncus. Integer luctus risus eget nibh tincidunt accumsan. Suspendisse nisl neque, varius eu ante facilisis,
          vulputate gravida mi. Integer sit amet turpis sed orci pharetra tincidunt ac ac tortor. Praesent gravida vitae
          risus vel ultrices. Pellentesque sagittis ipsum lorem, eget finibus sapien tempus ut. Duis aliquet vel odio
          eget posuere. Fusce in nibh quis dui egestas euismod in eget leo. Nullam eget nulla quam. Praesent interdum,
          sapien sit amet sodales finibus, erat dolor egestas est, nec consectetur lacus mauris eget velit. Integer
          molestie turpis et lorem ultricies fringilla at nec libero. Nunc imperdiet sapien non accumsan commodo.
        </p>
        <p>
          Phasellus eget augue mattis, ullamcorper massa eu, ornare lacus. Sed in eros risus. Praesent egestas velit ut
          dui finibus varius. Vestibulum vel mauris quis nulla porta consequat sit amet a tortor. Maecenas laoreet ante
          nec lectus malesuada faucibus. Sed dapibus est eu sagittis malesuada. Mauris nisi magna, consectetur sit amet
          sem ut, tempus consequat dui. Curabitur auctor nulla et dui fringilla faucibus. Phasellus fringilla nisl in
          pretium cursus. Etiam tristique lorem nec dui pretium, at pretium leo egestas. Nunc eu leo dignissim, sagittis
          eros eget, finibus lorem. Phasellus pellentesque leo tristique convallis semper. Proin lacinia lorem non nisl
          posuere, ac suscipit diam volutpat. Fusce enim lacus, maximus sit amet elit eu, tempus laoreet orci.
        </p>
        <p>
          Integer commodo malesuada nisi, quis ullamcorper magna mollis sed. Pellentesque at nibh et diam convallis
          interdum vel ut libero. Nam egestas in diam vitae eleifend. Class aptent taciti sociosqu ad litora torquent
          per conubia nostra, per inceptos himenaeos. Praesent sed fringilla est. Vivamus faucibus auctor porttitor.
          Nunc accumsan diam sed euismod fringilla. Donec fermentum risus eu elit dignissim vehicula. Nam placerat
          mauris dui, quis pharetra diam tristique nec. Vivamus eleifend ornare metus et auctor. Integer et velit
          maximus, laoreet neque et, varius orci. Praesent scelerisque hendrerit quam, eu accumsan magna finibus a.
        </p>
      </div>
    </ModalContentWithBottomCloseButton>
  )
}, {
  title: 'Jak hrát Solitaire',
  type: Type.DRAWER,
})

export default HowToPlay
