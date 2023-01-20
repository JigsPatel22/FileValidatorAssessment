/* eslint-disable no-unused-expressions */
import { shallow } from 'enzyme';
import FileValidator from './components/FileValidator';

describe('FileValidator', () => {
  const component = shallow(<FileValidator />);

  it('should be render a file input field and validate buton', () => {
    expect(component.find('input[type="file"]').exists).exists;
    expect(component.find('button').exists).exists;
  });

  it('should not downoad excel button initially', () => {
    expect(component.find('ExportToExcel')).not.exists;
  });


});
