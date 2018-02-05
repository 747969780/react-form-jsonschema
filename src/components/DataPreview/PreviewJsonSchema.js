import React from 'react';

import ReactJson from 'react-json-view';

// * 功能库
import utilFunc from '@utils/functions';

import {
  Input,
  Select,
  Button
} from 'antd';

const Option = Select.Option;

class PreviewJsonSchema extends React.Component {

  state = {
    searchInput: '',
    searchSelectedType: '',
    filterList: [],
    collapsed: false
  };

  filterList = [];

  editExcludeList = ['type'];

  deleteExcludeList = ['key', 'type', 'properties', 'items'];

  typeOptions = ['key', 'type', 'title', 'description', 'default', 'required', 'enum'];

  componentDidMount () {

  }

  // * ------------

  editHandle = (param) => {
    console.log('jsonschema editHandle param', param);
    if (param.name && this.editExcludeList.indexOf(param.name) === -1) {
      this.props.editJsonSchemaData(param);
      utilFunc.messageSuccess({
        message: '修改成功'
      });
      return true;
    } else if (
      // * 如果namespace最后一个是数字或者是additionalItems则修改无效
      param.namespace[param.namespace.length - 1] === 'additionItems'
      || !isNaN(Number(param.namespace[param.namespace.length - 1]))
    ) {
      utilFunc.messageError({
        message: '该属性修改也没有用的'
      });
      return false;
    } else {
      utilFunc.messageError({
        message: '该属性不能修改'
      });
      return false;
    }
  }

  deleteHandle = (param) => {
    console.log('jsonschema deleteHandle param', param);
    if (param.name && this.deleteExcludeList.indexOf(param.name) === -1) {
      this.props.deleteJsonSchemaData(param);
      utilFunc.messageSuccess({
        message: '删除成功'
      });
      return true;
    } else {
      utilFunc.messageError({
        message: '该属性不能删除'
      });
      return false;
    }
  }

  collapseTrigger = (value) => {
    this.setState((prevState, props) => {
      return {
        collapsed: value
      };
    });
  }

  // * ------------

  editFilterItemHandle = (param) => {
    console.log('editFilterItemHandle param', param);
    if (param.name && param.name === 'key') {
      this.props.addNewProperties({
        ...param.updated_src,
        oldKey: param.existing_value
      }, { prune: 'key' });
      utilFunc.nextTick(() => {
        this.compuFilter();
      });
    } else if (param.name && this.editExcludeList.indexOf(param.name) === -1) {
      this.props.addNewProperties(param.updated_src);
      utilFunc.messageSuccess({
        message: '修改成功'
      });
      return true;
    } else {
      utilFunc.messageError({
        message: '该属性不能修改'
      });
      return false;
    }
  }

  deleteFilterItemHandle = (param) => {
    console.log('deleteFilterItemHandle param', param);
    if (param.name && this.deleteExcludeList.indexOf(param.name) === -1) {
      this.props.addNewProperties(param.updated_src);
      utilFunc.messageSuccess({
        message: '删除成功'
      });
      return true;
    } else {
      utilFunc.messageError({
        message: '该属性不能删除'
      });
      return false;
    }
  }

  // * ------------

  searchSelectedTypeChange = (value) => {
    this.setState({
      searchSelectedType: value
    });
  }

  searchValueChange = (event) => {
    let tmpValue = event.target.value;
    this.setState({
      searchInput: tmpValue
    });
  }

  // * ------------

  resetFilterList = () => {
    this.filterList = [];
    this.setState({
      filterList: [],
      searchInput: '',
      searchSelectedType: ''
    });
  }

  compuFilter = () => {
    this.filterList = [];
    if (this.state.searchInput && this.state.searchSelectedType) {
      this.compuFilterByType(this.props.JSONSchema);
      this.setState({
        filterList: this.filterList
      });
    }
  }

  compuFilterPure = (item, searchType, searchValue) => {
    if (item[searchType]) {
      String(item[searchType]).indexOf(searchValue) !== -1 && (this.filterList.push(item));
    }
  }

  compuFilterByType = (data) => {
    switch (data.type) {
      case 'object':
        this.compuFilterFromObject(data, this.state.searchSelectedType, this.state.searchInput);
        break;
      case 'array':
        this.compuFilterFromArray(data, this.state.searchSelectedType, this.state.searchInput);
        break;
      default:
        this.compuFilterPure(data, this.state.searchSelectedType, this.state.searchInput);
    }
  }

  compuFilterFromObject = (object, searchType, searchValue) => {
    this.compuFilterPure(object, this.state.searchSelectedType, this.state.searchInput);
    if (object.properties === undefined || Object.keys(object.properties).length === 0) {
      return;
    }
    for (let item of Object.entries(object.properties)) {
      if (item[1].type === 'object') {
        this.compuFilterFromObject(item[1], this.state.searchSelectedType, this.state.searchInput);
      } else if (item[1].type === 'array') {
        this.compuFilterFromArray(item[1], this.state.searchSelectedType, this.state.searchInput);
      } else {
        this.compuFilterPure(item[1], this.state.searchSelectedType, this.state.searchInput);
      }
    }
  }

  compuFilterFromArray = (array, searchType, searchValue) => {
    this.compuFilterPure(array, this.state.searchSelectedType, this.state.searchInput);
    if (utilFunc.getPropertyJsType(array.items).indexOf('Array') !== -1 && array.items.length > 0) {
      for (let item of array.items) {
        this.compuFilterByType(item);
      }

      if (utilFunc.getPropertyJsType(array.additionalItems).indexOf('Object') !== -1 && array.additionalItems.type) {
        this.compuFilterByType(array.additionalItems);
      }
    } else {
      this.compuFilterFromObject(array.items, this.state.searchSelectedType, this.state.searchInput);
    }
  }

  // * ------------

  render () {
    const SelectSearchType = (
      <Select value={ this.state.searchSelectedType } onChange={ this.searchSelectedTypeChange }>
        {
          this.typeOptions.map((ele, index) => {
            return (
              <Option key={ index } value={ ele }>{ ele }</Option>
            )
          })
        }
      </Select>
    )
    const InputSearchTrigger = (
      <div>
        <span className="search-btn primary" onClick={ this.compuFilter }>搜索</span>
        <span className="search-btn danger" onClick={ this.resetFilterList }>重置</span>
      </div>
    )
    return (
      <div>
        <div className="mg-bottom-middle">
          <div className="mg-bottom-middle">
            <Button type="primary" onClick={ () => {
              this.collapseTrigger(false)
            } }>全部展开</Button>
            <Button type="primary" className="mg-left-middle" onClick={ () => {
              this.collapseTrigger(true)
            } }>全部收起</Button>
          </div>

          <Input addonBefore={ SelectSearchType } addonAfter={ InputSearchTrigger } value={ this.state.searchInput } onChange={ this.searchValueChange } />
        </div>

        { this.state.filterList && this.state.filterList.length === 0 ?
          <ReactJson src={ this.props.JSONSchema }
                     onDelete={ this.deleteHandle }
                     onEdit={ this.editHandle }
                     collapsed={ this.state.collapsed }/> :
          this.state.filterList.map((ele, index, arr) => {
            return (
              <div key={ index }>
                { ele.owner !== '' ?
                  <span>{ 'path: ' + ele.owner }</span> :
                  ''
                }
                <ReactJson src={ ele }
                           name={ ele.owner !== '' ? ele.key : 'root' }
                           collapsed={ this.state.collapsed }
                           onDelete={ this.deleteFilterItemHandle }
                           onEdit={ this.editFilterItemHandle } />
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default PreviewJsonSchema;
