import React from 'react';
import UISchema from '@components/SchemaCreator/UICreator/BooleanUICreator'

// * 样式


// * antd组件
import {
  Form,
  Input,
  Select,
  Button,
  Checkbox,
  Modal
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;

class BooleanSchemaCreator extends React.Component {

  state = {
    ownerList: [],
    ownerTypeStatus: 'object',
    asFixedItems: false,
    coverFixedItems: false,
    asDefinition: false,
    booleanSchema: {
      key: '',
      title: '',
      description: '',
      default: '',
      owner: ''
    }
  }

  UIschema = {}

  componentWillReceiveProps (nextProps) {
    console.log('o nextProps', nextProps);
    let tmpOwnerList = [];
    if (nextProps.properties) {
      tmpOwnerList = [{path: 'global', type: 'object'}].concat(this.compuOwnerList('global', nextProps.properties));
    } else if (nextProps.jsonSchema && nextProps.jsonSchema.type === 'array') {
      tmpOwnerList = this.compuOwnerListArray('', ['global', this.props.jsonSchema]);
    }
    this.setState({
      ownerList: tmpOwnerList
    });
  }

  componentDidMount () {
    console.log('o properties: ', this.props.properties);
    let tmpOwnerList = [];
    if (this.props.properties) {
      tmpOwnerList = [{path: 'global', type: 'object'}].concat(this.compuOwnerList('global', this.props.properties));
    } else if (this.props.jsonSchema && this.props.jsonSchema.type === 'array') {
      tmpOwnerList = this.compuOwnerListArray('', ['global', this.props.jsonSchema]);
    }
    this.setState({
      ownerList: tmpOwnerList
    });
  }

  // * ------------

  compuOwnerList = (path, properties) => {
    let tmpOwnerList = [];
    let propertiesEntryList = Object.entries(properties);
    // console.log('path properties', path, propertiesEntryList);
    for (let item of propertiesEntryList) {
      if (item[1].type === 'object') {
        tmpOwnerList = tmpOwnerList.concat(this.compuOwnerListObject(path, item));
      } else if (item[1].type === 'array') {
        tmpOwnerList = tmpOwnerList.concat(this.compuOwnerListArray(path, item));
      }
    }
    // console.log('path tmpOwnerList', path, tmpOwnerList);
    return tmpOwnerList;
  }

  compuOwnerListObject = (path, item, exclude = false) => {
    let tmpOwnerList = [];
    !exclude && tmpOwnerList.push({
      path: path + '~/~' + item[0],
      type: 'object'
    });
    tmpOwnerList = tmpOwnerList.concat(this.compuOwnerList(path + '~/~' + item[0], item[1].properties));
    return tmpOwnerList;
  }

  compuOwnerListArray = (path, item, exclude = false) => {
    let tmpOwnerList = [];
    let tmpPath = path + '~/~' + item[0];
    !exclude && tmpOwnerList.push({
      path: tmpPath,
      type: 'array'
    });
    if (item[1].items && Object.prototype.toString.call(item[1].items).indexOf('Array') !== -1) {
      let len = item[1].items.length;
      for (let i = 0; i < len; i++) {
        let tarr = this.compuOwnerListHelper(tmpPath, ['items~/~' + i, item[1].items[i]]);
        tmpOwnerList = tmpOwnerList.concat(tarr);
      }
      if (item[1].additionalItems && item[1].additionalItems.type !== undefined) {
        let tarr = this.compuOwnerListHelper(tmpPath, ['additionalItems', item[1].additionalItems]);
        tmpOwnerList = tmpOwnerList.concat(tarr);
      }
    } else if (item[1].items && Object.prototype.toString.call(item[1].items).indexOf('Object') !== -1) {
      let tarr = this.compuOwnerListHelper(tmpPath, ['items', item[1].items]);
      tmpOwnerList = tmpOwnerList.concat(tarr);
    }
    return tmpOwnerList;
  }

  compuOwnerListHelper = (path, item) => {
    let tmpOwnerList = [];
    if (item[1].type === 'object') {
      tmpOwnerList = tmpOwnerList.concat(this.compuOwnerListObject(path, item));
    } else if (item[1].type === 'array') {
      tmpOwnerList = tmpOwnerList.concat(this.compuOwnerListArray(path, item));
    }
    return tmpOwnerList;
  }

  resetForm = () => {
    this.setState({
      ownerTypeStatus: 'object',
      asFixedItems: false,
      coverFixedItems: false,
      asDefinition: false,
      asCreateDefinition: false,
      booleanSchema: {
        key: '',
        title: '',
        description: '',
        default: '',
        owner: ''
      }
    });
    this.UIschema.setState({
      ui: {}
    });
  }

  confirmForm = () => {
    console.log('confirmForm');
    let data = {
      ...this.state.booleanSchema,
      asDefinition: this.state.asDefinition,
      type: 'boolean'
    };
    if (this.state.ownerTypeStatus === 'array' && this.state.asFixedItems) {
      data.asFixedItems = true;
    } else if (this.state.ownerTypeStatus === 'array' && this.state.coverFixedItems) {
      data.coverFixedItems = true;
    }
    if (Object.keys(this.UIschema.state.ui).length > 0) {
      data.ui = this.UIschema.state.ui;
    }
    console.log(this.state.ownerList);
    this.props.addNewProperties(data);
    setTimeout(this.resetForm, 0);
  }

  ownerChange = (value) => {
    console.log('ownerChange value:', value);
    this.setState((prevState, props) => {
      return {
        booleanSchema: {
          ...prevState.booleanSchema,
          owner: prevState.ownerList[value].path
        },
        ownerTypeStatus: prevState.ownerList[value].type
      };
    });
  }

  keyInput = (event) => {
    let tmpValue = event.target.value;
    this.setState((prevState, props) => {
      return {
        booleanSchema: {
          ...prevState.booleanSchema,
          key: tmpValue
        }
      };
    });
  }

  titleInput = (event) => {
    let tmpValue = event.target.value;
    this.setState((prevState, props) => {
      return {
        booleanSchema: {
          ...prevState.booleanSchema,
          title: tmpValue
        }
      };
    });
  }

  descriptionInput = (event) => {
    let tmpValue = event.target.value;
    this.setState((prevState, props) => {
      return {
        booleanSchema: {
          ...prevState.booleanSchema,
          description: tmpValue
        }
      };
    });
  }

  defaultInput = (value) => {
    // let tmpValue = event.target.value;
    this.setState((prevState, props) => {
      return {
        booleanSchema: {
          ...prevState.booleanSchema,
          default: !(value === 'false')
        }
      };
    });
  }

  uiChange = (value) => {
    console.log('uiChange value:', value);
    this.setState((prevState, props) => {
      return {
        booleanSchema: {
          ...prevState.booleanSchema,
          ui: value
        }
      };
    });
  }

  // * ------------

  asFixedItemsStatusChange = (event) => {
    let checked = event.target.checked;
    this.setState({
      asFixedItems: checked,
      coverFixedItems: false
    });
  }

  coverFixedItemsStatusChange = (event) => {
    let checked = event.target.checked;
    this.setState({
      coverFixedItems: checked,
      asFixedItems: false
    });
  }

  handleConfirm = () => {
    if (!this.state.booleanSchema.key) {
      return;
    }
    if (this.state.booleanSchema.owner !== '') {
      this.confirmForm();
    } else {
      this.showMessage();
    }
  }

  showMessage = () => {
    confirm({
      title: '消息提示',
      content: '提示：所属对象为空将覆盖根目录已有的属性，是否继续？',
      onOk: () => {
        this.confirmForm();
      }
    });
  }

  asDefinitionStatusChange = (e) => {
    let checked = e.target.checked;
    if (!checked) {
      this.setState({
        asDefinition: checked,
      })
    } else {
      this.setState({
        asDefinition: checked,
        asCreateDefinition: !checked
      })
    }
    
  }

  asCreateDefinitionStatusChange = (e) => {
    let checked = e.target.checked;
    if (!checked) {
      this.setState({
        asCreateDefinition: checked,
      })
    } else {
      this.setState({
        asCreateDefinition: checked,
        asDefinition: !checked
      })      
    }
  }

  // * ------------

  render () {
    return (
      <Form>
        <FormItem>
          <Checkbox checked={this.state.asDefinition} onChange={this.asDefinitionStatusChange}>设置ref</Checkbox>
        </FormItem>
        <FormItem>
          <Checkbox checked={this.state.asCreateDefinition} onChange={this.asCreateDefinitionStatusChange}>创建Definition</Checkbox>
        </FormItem>
        {
          this.state.asDefinition &&
          <FormItem label="选择definition" className="nested-form-item">
            <Select defaultValue="lucy">
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>Disabled</Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          </FormItem>
        }
        {
          this.state.asCreateDefinition && 
          <FormItem label="选择所属definition" className="nested-form-item">
            <Select defaultValue="lucy">
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>Disabled</Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          </FormItem>
        }
        {
          !this.state.asDefinition && 
          <>
            {
              !this.state.asCreateDefinition &&
              <FormItem label="选择所属对象">
                <Select value={ this.state.booleanSchema.owner } onChange={ this.ownerChange }>
                  {
                    this.state.ownerList.map((ele, index, arr) => {
                      return (
                        <Option key={ ele.path + index } value={ index }>
                          <div style={ {
                            position: 'relative'
                          } }>
                            <span style={ {
                              position: 'absolute',
                              top: '0',
                              left: '0'
                            } }>{ ele.type + ' : ' }</span>
                            <span style={ {
                              marginLeft: '70px'
                            } }>{ ele.path }</span>
                          </div>
                        </Option>
                      )
                    })
                  }
                </Select>
                { this.state.ownerTypeStatus === 'array' &&
                  <div>
                    <Checkbox checked={ this.state.asFixedItems } onChange={ this.asFixedItemsStatusChange }>使用fixedItems</Checkbox>
                    <Checkbox checked={ this.state.coverFixedItems } onChange={ this.coverFixedItemsStatusChange }>覆盖fixedItems</Checkbox>
                    <p>选择的目标为数组，可以作为items或fixedItems(如果使用了fixedItems，目标已有items会自动变成addtionalItems，如果不使用fixedItems，则会把已有的items)</p>
                  </div>
                }
              </FormItem>
            }
            <FormItem label="key">
              <Input value={ this.state.booleanSchema.key } onInput={ this.keyInput }></Input>
            </FormItem>

            <FormItem label="title">
              <Input value={ this.state.booleanSchema.title } onInput={ this.titleInput }></Input>
            </FormItem>

            <FormItem label="description">
              <Input value={ this.state.booleanSchema.description } onInput={ this.descriptionInput }></Input>
            </FormItem>

            <FormItem label="default">
              <Select value={ this.state.booleanSchema.default.toString() } onChange={ this.defaultInput }>
                <Option value="true">true</Option>
                <Option value="false">false</Option>
              </Select>
            </FormItem>
            {
              !this.state.asCreateDefinition &&
              <FormItem label="设置ui：">
                <div className="nested-form-item">
                  <UISchema ref={ (ui) => {
                    this.UIschema = ui;
                  }}/>
                </div>
              </FormItem>
            }
          </>
        }
        <FormItem className="form-buttons">
          <Button type="danger" onClick={ this.resetForm }>重置</Button>
          <Button type="primary" onClick={ this.handleConfirm }>确认</Button>
        </FormItem>
      </Form>
    );
  }
}

export default BooleanSchemaCreator;
