import React from 'react';
//import Swiper core and required modules
import swiper, {Scrollbar, A11y, Thumbs} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';
//Import swiper styles
import 'swiper/swiper.min.css';
//import 'swiper/components/navigation/navigation.min.css';
//import 'swiper/components/pagination/pagination.min.css';
import 'swiper/components/scrollbar/scrollbar.min.css';
import 'swiper/components/thumbs/thumbs.min.css';
import {Text, Link, Image} from 'nuudel-core';
import styles from './styles.module.scss';
import clsx from 'clsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

swiper?.use([Scrollbar, A11y, Thumbs]); //Navigation, Pagination
//extends SliderProps
export interface ISliderProps {
  contex?: any;
  style?: any;
  className?: string;
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
    className: '',
  };

  public componentWillUnmount(): void {}

  private openProduct = (item: any) => {};

  /**
   * Render item of carousel
   */
  _renderItem = ({item, index}) => {
    return (
      <div className={styles.slideContainer}>
        <Link
          className={styles.slideInnerContainer}
          onClick={ev => this.openProduct(item)}>
          <Image
            src={!item?.uri ? '/images/placeholder.png' : item.uri}
            className={clsx(styles.image, {
              backgroundColor: '#fff',
              borderRadius: this.props.borderRadius,
            })}
            alt="slide"
          />
          {!!item.title && <Text className={styles.title}>{item.title}</Text>}
          {!!item.subtitle && (
            <Text className={styles.subtitle}>{item.subtitle}</Text>
          )}
        </Link>
      </div>
    );
  };

  render() {
    const {images} = this.props;
    if (images instanceof Array && images.length > 0) {
      const {ActiveSlide} = this.state;

      return (
        <div className={clsx(styles.sliderContainer, this.props.className)}>
          <div className="productSliderThumb">
            {images.length > 5 && (
              <button type="button" className={'prevThumbBtn'}>
                <ExpandLessIcon />
              </button>
            )}
            <Swiper
              style=\{{maxHeight: '420px'}}
              onSwiper={(sw: swiper) =>
                this.setState({thumbsSwiper: sw || null})
              }
              direction={'vertical'}
              spaceBetween={6}
              slidesPerView={6}
              allowTouchMove={false}
              width={70}
              height={420}
              navigation=\{{
                prevEl: '.prevThumbBtn',
                nextEl: '.nextThumbBtn',
              }}>
              {images.map((img, i: number) => (
                <SwiperSlide key={i} virtualIndex={i}>
                  <Image src={img.uri} alt="slide" />
                </SwiperSlide>
              ))}
            </Swiper>
            {images.length > 5 && (
              <button type="button" className={'nextThumbBtn'}>
                <ExpandMoreIcon />
              </button>
            )}
          </div>
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            navigation=\{{
              prevEl: '.prevProductBtn',
              nextEl: '.nextProductBtn',
            }}
            thumbs=\{{
              swiper:
                this.state.thumbsSwiper && !this.state.thumbsSwiper.destroyed
                  ? this.state.thumbsSwiper
                  : null,
            }}
            className={styles.mainSlider + ' productSlider'}>
            {images.map((img, i: number) => (
              <SwiperSlide key={i} virtualIndex={i}>
                <Image src={img.uri} alt="slide" />
              </SwiperSlide>
            ))}
            <button
              type="button"
              className={styles.prevProductBtn + ' prevProductBtn'}>
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className={styles.nextProductBtn + ' nextProductBtn'}>
              <ChevronRightIcon />
            </button>
          </Swiper>
        </div>
      );
    } else return <></>;
  }
}

export default Slideshow;
