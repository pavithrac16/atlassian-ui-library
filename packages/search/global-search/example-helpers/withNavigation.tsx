import * as React from 'react';
import { ComponentType } from 'react';
import styled from 'styled-components';
import { GlobalQuickSearch, Props } from '../src';
import BasicNavigation from './BasicNavigation';
import { setupMocks, teardownMocks } from './mockApis';
import LocaleIntlProvider from './LocaleIntlProvider';

const RadioGroup = styled.div`
  position: relative;
  padding: 4px;
  z-index: 1000;
  width: 340px;
  margin-left: 54px;
`;

const Radio = styled.input`
  margin-left: 16px;
  margin-right: 8px;
`;

interface State {
  context: 'home' | 'jira' | 'confluence';
  locale: string;
}

export default function withNavigation(
  WrappedComponent: ComponentType<Props>,
): ComponentType<Partial<Props>> {
  return class WithNavigation extends React.Component<Props> {
    static displayName = `WithNavigation(${WrappedComponent.displayName ||
      WrappedComponent.name})`;

    handleContextChange = e => {
      this.setState({
        context: e.target.value,
      });
    };

    handleLocaleChange = e => {
      this.setState({
        locale: e.target.value,
      });
    };

    state: State = {
      context: 'confluence',
      locale: 'en',
    };

    render() {
      const { context, locale } = this.state;

      return (
        <>
          <RadioGroup>
            Context:
            <Radio
              type="radio"
              id="confluence"
              name="context"
              value="confluence"
              onChange={this.handleContextChange}
              checked={context === 'confluence'}
            />
            <label htmlFor="confluence">Confluence</label>
            <Radio
              type="radio"
              id="home"
              name="context"
              value="home"
              onChange={this.handleContextChange}
            />
            <label htmlFor="home">Home</label>
            <Radio
              type="radio"
              id="jira"
              name="context"
              value="jira"
              onChange={this.handleContextChange}
            />
            <label htmlFor="jira">Jira</label>
          </RadioGroup>

          <RadioGroup>
            Locale:
            <Radio
              type="radio"
              id="defaultLocale"
              name="locale"
              value="en"
              onChange={this.handleLocaleChange}
              checked={locale === 'en'}
            />
            <label htmlFor="defaultLocale">EN</label>
            <Radio
              type="radio"
              id="esLocale"
              name="locale"
              value="es"
              onChange={this.handleLocaleChange}
            />
            <label htmlFor="esLocale">ES</label>
            <Radio
              type="radio"
              id="ptBRLocale"
              name="locale"
              value="pt-BR"
              onChange={this.handleLocaleChange}
            />
            <label htmlFor="ptBRLocale">pt-BR</label>
            <Radio
              type="radio"
              id="zhLocale"
              name="locale"
              value="zh"
              onChange={this.handleLocaleChange}
            />
            <label htmlFor="zhLocale">ZH</label>
          </RadioGroup>

          <BasicNavigation
            searchDrawerContent={
              <LocaleIntlProvider locale={locale}>
                <WrappedComponent
                  cloudId="cloudId"
                  context={context}
                  {...this.props}
                />
              </LocaleIntlProvider>
            }
          />
        </>
      );
    }
  };
}
