import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CellShimmer = () => {
  return (
    <div className="cell">
      <div className="cell__side">
        <button className="cell__toggle" style={{ cursor: 'default' }}>
          <Skeleton circle width={24} height={24} />
        </button>
      </div>

      <div className="cell__content">
        <div className="cell__info">
          <div className="cell__right">
            <Skeleton width={30} height={24} />
            <Skeleton width={40} className="ml-1" />
          </div>

          <div className="cell__wrapper">
            <div className="cell__top">
              <div className="cell__top__info">
                <Skeleton circle width={20} height={20} />
                <Skeleton width={120} className="ml-2" />
              </div>
            </div>
            <div className="cell__bottom">
              <Skeleton width={180} />
            </div>
          </div>
        </div>

        <div className="actions-row" style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <Skeleton width={80} height={32} borderRadius={20} />
          <Skeleton width={80} height={32} borderRadius={20} />
          <Skeleton width={80} height={32} borderRadius={20} />
          <Skeleton width={80} height={32} borderRadius={20} />
        </div>

        <div className="cell__dropdown">
          <div className="spot-row" style={{ marginBottom: '12px' }}>
            <Skeleton width="100%" height={40} />
          </div>
          <div className="cell__dropdown_inner">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mail-line" style={{ marginBottom: '8px' }}>
                <Skeleton width={80} height={16} />
                <Skeleton width="70%" height={16} style={{ marginTop: '4px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellShimmer;