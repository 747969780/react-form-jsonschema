import React from 'react';

// * 样式
import styles from './JsonSchema.less';

import { cloneDeep } from 'lodash';

import ObjectSchemaCreator from '@components/SchemaCreator/ObjectSchemaCreator';
import StringSchemaCreator from '@components/SchemaCreator/StringSchemaCreator';
import NumberSchemaCreator from '@components/SchemaCreator/NumberSchemaCreator';
import BooleanSchemaCreator from '@components/SchemaCreator/BooleanSchemaCreator';
import ArraySchemaCreator from '@components/SchemaCreator/ArraySchemaCreator';

// * antd组件
import {
  Tabs,
  message
} from 'antd';

const TabPane = Tabs.TabPane;

class JsonSchema extends React.Component {

  state = {
    JSONSchema: {
      definitions: {
        Thing: {
          type: "object",
          properties: {
            name: {
              type: "string",
              title: "Default title",
              definitions: {
                Hg: {
                  type: "string",
                  title: "nyrethy"
                }
              }
            }
          },
          definitions: {
            News: {
              type: "string",
              title: "a",
              default: "dd"
            },
            Ew: {
              type: 'array',
              title: 'feiw',
              items: [
                {
                  type: 'string',
                  title: 'ruwe'
                }
              ]
            }
          }
        },
        Shing: {
          type: "object",
          properties: {
            name: {
              type: "string",
              title: "Default title"
            }
          },
          definitions: {
            Io: {
              type: "number",
              title: "a",
              default: "dd",
              definitions: {
                Rt: {
                  type: "string",
                  title: "uriqy"
                }
              }
            }
          }
        }
      },
      type: 'array',
      title: 'fw items',
      items: [{
        type: 'string',
        title: 'grew'
      }, {
        type: 'object',
        title: 'heiouwq',
        properties: {}
      }],
      additionalItems: {
        type: 'object',
        title: 'bytrhjh',
        properties: {}
      }
      // type: 'object',
      // title: 'outer-object-title',
      // description: 'outer-object-desc',
      // required: [],
      // properties: {
        // tsobject: {
        //   type: 'object',
        //   title: 'test title',
        //   properties: {
        //     gfru: {
        //       type: 'object',
        //       title: 'vgrhtyh',
        //       properties: {}
        //     },
        //     fw: {
        //       type: 'array',
        //       title: 'dewq',
        //       items: {
        //         type: 'array',
        //         title: 'fw items',
        //         // properties: {},
        //         items: [{
        //           type: 'string',
        //           title: 'grew'
        //         }, {
        //           type: 'object',
        //           title: 'heiouwq',
        //           properties: {}
        //         }],
        //         additionalItems: {
        //           type: 'object',
        //           title: 'bytrhjh',
        //           properties: {}
        //         }
        //       }
        //     },
        //     hg: {
        //       type: 'array',
        //       title: 'froiehf',
        //       items: {
        //         type: 'string',
        //         title: 'froeih',
        //         enum: [
        //           'tu',
        //           'gbyu'
        //         ]
        //       }
        //     }
        //   }
        // },
        // tsarray: {
        //   type: 'array',
        //   title: 'tsarray tittle',
        //   items: [{
        //     type: 'string',
        //     title: 'grew'
        //   }, {
        //     type: 'object',
        //     title: 'heiouwq',
        //     properties: {}
        //   }]
        // }
      // }
    },
    UISchema: {},
    FormData: {}
  }

  componentDidMount () {

  }

  componentDidCatch () {
    this.messageError({
      message: '出现未知错误'
    });
  }

  // * ------------

  getPropertyJsType = (property) => {
    return Object.prototype.toString.call(property);
  }

  getRefRealPath = (refList) => {
    let resRef = '#';
    for (let ref of refList) {
      resRef += '/' + ref;
    }
    return resRef;
  }

  // * 添加新的属性
  addNewProperties = (newProperty) => {
    console.log('addNewProperties newProperty:', newProperty);
    let owner = newProperty.owner;
    let ownerList = owner.split('~/~');

    // * 在根目录添加
    if (ownerList.length === 1 && ownerList[0] === '') {
      this.setState((prevState, props) => {
        let data = {
          JSONSchema: {},
          UISchema: {},
          FormData: ''
        };

        if (newProperty.default !== undefined) {
          data.FormData = newProperty.default;
        } else if (newProperty.type === 'object') {
          data.FormData = {};
        } else if (newProperty.type === 'array') {
          data.FormData = [];
        }

        newProperty.ui = newProperty.ui ? newProperty.ui : {};
        for (let item of Object.entries(newProperty.ui)) {
          data.UISchema['ui:' + item[0]] = item[1];
        }
        delete newProperty.ui;

        data.JSONSchema = {
          ...newProperty
        }
        if (prevState.JSONSchema.definitions) {
          data.JSONSchema.definitions = prevState.JSONSchema.definitions;
        }
        return {
          ...data
        }
      }, () => {
        this.messageSuccess({
          message: '添加成功'
        });
      });
      return;
    }

    // * 非根目录的情况
    let useProperties = null;
    let tmpProperties = null;

    if (this.state.JSONSchema.type === 'object') {
      useProperties = cloneDeep(this.state.JSONSchema.properties);
      tmpProperties = useProperties; // * 用来定位JsonSchema具体的位置
    } else if (this.state.JSONSchema.type === 'array') {
      useProperties = cloneDeep(this.state.JSONSchema);
      tmpProperties = useProperties; // * 用来定位JsonSchema具体的位置
    }

    let useUISchema = cloneDeep(this.state.UISchema);
    let tmpUISchema = useUISchema; // * 用来定位UISchema具体的位置

    let useFormData = cloneDeep(this.state.FormData);
    let tmpFormData = useFormData; // * 用来定位FormData具体的位置

    for (let item of ownerList) {
      if (
        item !== 'global'
        && tmpProperties[item]
      ) {
        tmpProperties = tmpProperties[item];

      } else if (
        item !== 'global'
        && tmpProperties.type === 'object'
        && tmpProperties.properties[item]
      ) {
        tmpProperties = tmpProperties.properties[item];

      } else if (
        item !== 'global'
        && tmpProperties.type === 'array'
        && tmpProperties[item]
      ) {
        tmpProperties = tmpProperties[item];
      }

      // * ui相关---------------
      // * 创建ui对象路径
      item !== 'global' && !useUISchema[item] && (useUISchema[item] = {});
      item !== 'global' && (useUISchema = useUISchema[item]);
      // * ui相关---------------

      // * formData相关------------
      // * 创建tmpProperties对应的formData
      let jsType = this.getPropertyJsType(useFormData);
      if (item !== 'global' && !useFormData[item]) {
        let tmpD = tmpProperties.type === 'array' ? [] : {};
        // * 如果useFormData是数组，则添加一个对象进去
        if (jsType.indexOf('Array') !== -1) {
          useFormData.push(tmpD);
          let pos = useFormData.length - 1;
          useFormData = useFormData[pos];
        }

        // * 如果useFormData是对象，则按照通常方法创造子对象
        jsType.indexOf('Object') !== -1 && !useFormData[item] && (useFormData[item] = tmpD);
      }
      item !== 'global' && (useFormData = useFormData[item]);
      // * formData相关------------
    }

    // * ui相关---------------
    // * 设置ui最终位置的js类型与key名
    if (tmpProperties.type === 'object' || (ownerList.length === 1 && ownerList[0] === '')) {
      useUISchema[newProperty.key] = {
        ...useUISchema[newProperty.key]
      };
      useUISchema = useUISchema[newProperty.key];

    } else if (tmpProperties.type === 'array' && newProperty.asFixedItems) {
      if (useUISchema['items'] && Object.keys(useUISchema['items']).length > 0) {
        useUISchema['additionalItems'] = useUISchema['items'];
      }

      if (this.getPropertyJsType(useUISchema['items']).indexOf('Array') === -1) {
        useUISchema['items'] = [];
      }
      useUISchema = useUISchema['items'];
    } else if (tmpProperties.type === 'array' && newProperty.coverFixedItems) {
      delete useUISchema['additionalItems'];

      useUISchema['items'] = {};
      useUISchema = useUISchema['items'];
    } else {
      let hasArray = this.getPropertyJsType(tmpProperties.items).indexOf('Array');
      let name = hasArray !== -1 ? 'additionalItems' : 'items';
      useUISchema[name] = {};
      useUISchema = useUISchema[name];
    }

    // * 将ui加入到目标位置
    newProperty.ui = newProperty.ui ? newProperty.ui : {};
    if (this.getPropertyJsType(useUISchema).indexOf('Array') !== -1) {
      let data = {};
      for (let item of Object.entries(newProperty.ui)) {
        data['ui:' + item[0]] = item[1];
      }
      useUISchema[tmpProperties.items.length] = data;
      for (let i = 0; i < tmpProperties.items.length; i++) {
        if (typeof useUISchema[i] === 'undefined') {
          useUISchema[i] = {};
        }
      }
    } else if (this.getPropertyJsType(useUISchema).indexOf('Object') !== -1) {
      for (let item of Object.entries(newProperty.ui)) {
        useUISchema['ui:' + item[0]] = item[1];
      }
    }

    delete newProperty.ui;
    // * ui相关---------------

    // * formData相关------------
    // * 如果没有设置default，则再formdata中设置对应的key
    if (newProperty.type === 'object') {
      useFormData[newProperty.key] = {};
    } else if (newProperty.type === 'array') {
      useFormData[newProperty.key] = [];
    } else if (newProperty.default === undefined) {
      if (this.getPropertyJsType(useFormData).indexOf('Object') !== -1) {
        useFormData[newProperty.key] = '';
      }
    }
    // * formData相关------------

    // * 如果是使用$ref的情况，获取$ref的正式路径
    if (newProperty.$ref) {
      newProperty.$ref = this.getRefRealPath(newProperty.$ref.split('~/~'));
    }

    // * 将新建的属性加入到目标位置
    if (
      tmpProperties
      && tmpProperties.type === 'object'
      && tmpProperties.properties
    ) {
      tmpProperties.properties[newProperty.key] = newProperty;
    } else if (
      tmpProperties
      && tmpProperties.type === 'array'
      && newProperty.asFixedItems
    ) {
      delete newProperty.asFixedItems;
      if (Object.prototype.toString.call(tmpProperties.items).indexOf('Object') !== -1) {
        tmpProperties.additionalItems = tmpProperties.items;
        tmpProperties.items = [];
        tmpProperties.items.push(newProperty);
      } else if (Object.prototype.toString.call(tmpProperties.items).indexOf('Array') !== -1) {
        tmpProperties.items.push(newProperty);
      } else {
        tmpProperties.items = [];
        tmpProperties.items.push(newProperty);
      }
    } else if (
      tmpProperties
      && tmpProperties.type === 'array'
      && newProperty.coverFixedItems
    ) {
      delete newProperty.coverFixedItems;
      delete tmpProperties.additionalItems;
      tmpProperties.items = newProperty;
    } else if (
      tmpProperties
      && tmpProperties.type === 'array'
    ) {
      if (Object.prototype.toString.call(tmpProperties.items).indexOf('Array') !== -1) {
        tmpProperties.additionalItems = newProperty;
      } else {
        tmpProperties.items = newProperty;
      }
    } else {
      tmpProperties[newProperty.key] = newProperty;
    }

    this.setState((prevState, props) => {
      let data =  {
        JSONSchema: {
          ...prevState.JSONSchema
        }
      };
      if (this.state.JSONSchema.type === 'object') {
        data.JSONSchema.properties = useProperties;
      } else if (this.state.JSONSchema.type === 'array') {
        data.JSONSchema = Object.assign(data.JSONSchema, useProperties);
      }
      data.UISchema = {
        ...prevState.UISchema,
        ...tmpUISchema
      };
      data.FormData = {
        ...prevState.FormData,
        ...tmpFormData
      };
      return {
        ...data
      }
    }, () => {
      this.messageSuccess({
        message: '添加成功'
      });
    });
  }

  addNewDefinition = (newDefinition) => {
    delete newDefinition.ui;

    console.log('addNewDefinition newDefinition:', newDefinition);

    let defOwner = newDefinition.defOwner;
    let defOwnerList = defOwner.split('~/~');
    console.log('defOwnerList', defOwnerList);

    let useDefObj = cloneDeep(this.state.JSONSchema);
    let tmpDefObj = useDefObj;

    for (let item of defOwnerList) {
      tmpDefObj[item] || (tmpDefObj[item] = {});
      tmpDefObj = tmpDefObj[item];
    }
    if (defOwnerList[defOwnerList.length - 1] !== 'definitions') {
      tmpDefObj['definitions'] = {};
      tmpDefObj = tmpDefObj['definitions'];
    }
    tmpDefObj[newDefinition.key] = newDefinition;
    console.log('useDefObj', useDefObj);
    this.setState((prevState, props) => {
      return {
        JSONSchema: {
          ...useDefObj
        }
      };
    });
  }

  // * ------------

  messageSuccess = (param = {
    message: '成功'
  }) => {
    message.success(param.message, () => {

    });
  }
  messageError = () => {

  }
  messageWarning = () => {

  }
  messageInfo = () => {

  }

  // * ------------

  render () {
    return (
      <div className="json-schema-container">
        <Tabs defaultActiveKey="1" onChange={this.tabsChange}>
          <TabPane tab="创建Object" key="1">
            <div className={ styles.jsonSchemaTabPane }>
              <ObjectSchemaCreator properties={
                this.state.JSONSchema.properties
              } addNewProperties={
                this.addNewProperties
              } jsonSchema={
                this.state.JSONSchema
              } definitions={
                this.state.JSONSchema.definitions
              } addNewDefinition={
                this.addNewDefinition
              }></ObjectSchemaCreator>
            </div>
          </TabPane>
          <TabPane tab="创建String" key="2">
            <div className={ styles.jsonSchemaTabPane }>
              <StringSchemaCreator properties={
                this.state.JSONSchema.properties
              } addNewProperties={
                this.addNewProperties
              } jsonSchema={
                this.state.JSONSchema
              } definitions={
                this.state.JSONSchema.definitions
              } addNewDefinition={
                this.addNewDefinition
              }></StringSchemaCreator>
            </div>
          </TabPane>
          <TabPane tab="创建Number" key="3">
            <div className={ styles.jsonSchemaTabPane }>
              <NumberSchemaCreator properties={
                this.state.JSONSchema.properties
              } addNewProperties={
                this.addNewProperties
              } jsonSchema={
                this.state.JSONSchema
              } definitions={
                this.state.JSONSchema.definitions
              } addNewDefinition={
                this.addNewDefinition
              }></NumberSchemaCreator>
            </div>
          </TabPane>
          <TabPane tab="创建Boolean" key="4">
            <div className={ styles.jsonSchemaTabPane }>
              <BooleanSchemaCreator properties={
                this.state.JSONSchema.properties
              } addNewProperties={
                this.addNewProperties
              } jsonSchema={
                this.state.JSONSchema
              } definitions={
                this.state.JSONSchema.definitions
              } addNewDefinition={
                this.addNewDefinition
              }></BooleanSchemaCreator>
            </div></TabPane>
          <TabPane tab="创建Array" key="5">
            <div className={ styles.jsonSchemaTabPane }>
              <ArraySchemaCreator properties={
                this.state.JSONSchema.properties
              } addNewProperties={
                this.addNewProperties
              } jsonSchema={
                this.state.JSONSchema
              } definitions={
                this.state.JSONSchema.definitions
              } addNewDefinition={
                this.addNewDefinition
              }></ArraySchemaCreator>
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default JsonSchema;
