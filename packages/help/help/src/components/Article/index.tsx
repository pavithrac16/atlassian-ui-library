import * as React from 'react';
import HelpArticle from '@atlaskit/help-article';
import RelatedArticles from './RelatedArticles';
import RatingButton from './RatingButton';

import { Article as ArticleModel } from '../../model/Article';

export interface Props {
  article: ArticleModel;
  children?: any;
}

const Article: React.SFC<Props> = props => {
  const { article } = props;

  if (article) {
    return (
      <>
        <HelpArticle
          title={article.title}
          body={article.body}
          titleLinkUrl={article.productUrl}
        />
        <RatingButton />
        <RelatedArticles relatedArticles={article.relatedArticles} />
      </>
    );
  } else {
    return null;
  }
};

export default Article;
