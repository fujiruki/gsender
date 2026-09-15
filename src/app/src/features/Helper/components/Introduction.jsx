import React from 'react';
import styles from '../index.module.styl';
import { t } from 'app/i18n';

const Introduction = ({ description, title }) => {
    return (
        <div className={styles.introduction}>
            <i className="fas fa-exclamation-circle" />
            <h2>{t(title)}</h2>
            <p>{t(description)}</p>
        </div>
    );
};

export default Introduction;
