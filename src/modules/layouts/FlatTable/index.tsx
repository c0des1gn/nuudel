import React, { Fragment } from 'react';
import { Text, Link } from 'nuudel-core';
import ArrowRight from '@material-ui/icons/ArrowRight';
import styles from './styles.module.scss';
import clsx from 'clsx';

interface IFlatTableProps {
  data: any;
}

interface IFlatTableStates {
  data: any;
}

class FlatTable extends React.Component<IFlatTableProps, IFlatTableStates> {
  constructor(props: IFlatTableProps) {
    super(props);
    this.state = {
      data: props.data,
    };
  }

  protected _renderItem = (item, index) => (
    <Fragment key={index}>
      <div className={!item.header ? '' : styles.header} />
      <Link onClick={() => {}}>
        <div className={styles.body}>
          <div className={styles.item}>
            <span className={styles.title}>{item['title']}</span>
            <span className={styles.content}>{item['text']}</span>
          </div>
          {item.isPress === true && (
            <div className={clsx(styles.right, styles.float)}>
              <ArrowRight />
            </div>
          )}
        </div>
      </Link>
    </Fragment>
  );

  componentDidUpdate(prevProps) {
    const { data } = this.props;
    if (prevProps.data !== data) {
      this.setState({
        data,
      });
    }
  }

  render() {
    const { data } = this.state;
    return <div className={styles.container}>{data.map(this._renderItem)}</div>;
  }
}

export default FlatTable;
