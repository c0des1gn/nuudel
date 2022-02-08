import React from 'react';
// import Swiper core and required modules
import swiper, {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Thumbs,
} from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import swiper styles
import 'swiper/swiper.min.css';
import 'swiper/components/navigation/navigation.min.css';
import 'swiper/components/pagination/pagination.min.css';
import 'swiper/components/scrollbar/scrollbar.min.css';
import 'swiper/components/thumbs/thumbs.min.css';
import { Text, Link, Image } from 'nuudel-core';
//import { isServer } from '@Utils';
import styles from './styles.module.scss';
import clsx from 'clsx';

swiper.use([Navigation, Pagination, Scrollbar, A11y, Thumbs]);
//extends SliderProps
export interface ISliderProps {
  contex?: any;
  style?: any;
  images: any[];
  ratio: number;
  columns: number;
  borderRadius: number;
  showPagination: boolean;
}

export interface ISliderStates {
  ActiveSlide: number;
  ratio: number;
  thumbsSwiper: swiper | null;
}

export class Slideshow extends React.Component<ISliderProps, ISliderStates> {
  constructor(props: ISliderProps) {
    super(props);

    this.state = {
      ActiveSlide: 0,
      ratio: props.ratio > 0 ? props.ratio : 0,
      thumbsSwiper: null,
    };
  }

  static defaultProps = {
    componentId: '',
    images: [],
    columns: 1,
    ratio: 1,
    showPagination: true,
    borderRadius: 0,
    style: {},
  };

  public componentWillUnmount(): void {}

  private openProduct = (item: any) => {};

  /**
   * Render item of carousel
   */
  _renderItem = ({ item, index }) => {
    return (
      <div className={styles.slideContainer}>
        <Link
          className={styles.slideInnerContainer}
          onClick={ev => this.openProduct(item)}
        >
          {item && item.uri ? (
            <Image
              src={item.uri}
              className={clsx(styles.image, {
                backgroundColor: '#fff',
                borderRadius: this.props.borderRadius,
              })}
            />
          ) : (
            <Image src={require('../../../public/images/placeholder.png')} />
          )}
          {!!item.title && <Text className={styles.title}>{item.title}</Text>}
          {!!item.subtitle && (
            <Text className={styles.subtitle}>{item.subtitle}</Text>
          )}
        </Link>
      </div>
    );
  };

  render() {
    const { images } = this.props;
    if (images instanceof Array && images.length > 0) {
      const { ActiveSlide } = this.state;

      return (
        <div className={clsx(styles.sliderContainer, this.props.style)}>
          <Swiper
            // install Swiper modules
            //modules={[Navigation, Pagination, Scrollbar, A11y]}
            //observer={isServer}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            thumbs={{ swiper: this.state.thumbsSwiper }}
            onSwiper={swiper => {}}
            onSlideChange={() => console.log('slide change')}
            className={styles.mainSlider}
          >
            {images.map((img, i: number) => (
              <SwiperSlide key={i} virtualIndex={i}>
                <Image src={img.uri} />
              </SwiperSlide>
            ))}
          </Swiper>
          <Swiper
            onSwiper={(sw: swiper) => this.setState({ thumbsSwiper: sw })}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            navigation
            watchSlidesProgress={true}
            className={styles.thumbSlider}
          >
            {images.map((img, i: number) => (
              <SwiperSlide key={i} virtualIndex={i}>
                <Image src={img.uri} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      );
    } else return <></>;
  }
}

export default Slideshow;
