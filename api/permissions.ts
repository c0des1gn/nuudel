/*
Read - get one item
List - get many items
Add - add new item
Edit - update item
Delete - remove item
All - get all items without _userId limit
*/
export const _permissions = [
  {
    listname: 'Default',
    Manager: { Read: true, List: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, List: true, Add: true, Edit: false, Delete: false },
    Partner: { Read: true, List: true, Add: true, Edit: true, Delete: true },
    Guest: { Read: false, List: false, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'User',
    Manager: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    User: { Read: false, List: false, Add: false, Edit: false, Delete: false },
    Viewer: {
      Read: false,
      List: false,
      Add: false,
      Edit: false,
      Delete: false,
    },
    Guest: { Read: false, List: false, Add: true, Edit: false, Delete: false },
  },
  {
    listname: 'Pushnotification',
    Manager: { Read: true, List: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, List: true, Add: false, Edit: false, Delete: true },
    Viewer: { Read: true, List: true, Add: false, Edit: false, Delete: true },
    Guest: { Read: false, List: false, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Notification',
    Admin: { All: false },
    Manager: { Read: true, List: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, List: true, Add: true, Edit: false, Delete: true },
    Viewer: { Read: true, List: true, Add: true, Edit: false, Delete: true },
    Guest: { Read: true, List: true },
  },
  {
    listname: 'Verify',
    Manager: {
      Read: false,
      List: false,
      Add: false,
      Edit: false,
      Delete: false,
    },
    User: { Read: false, List: false, Add: false, Edit: false, Delete: false },
    Viewer: {
      Read: false,
      List: false,
      Add: false,
      Edit: false,
      Delete: false,
    },
    Guest: { Read: false, List: false, Add: true, Edit: false, Delete: false },
  },
  {
    listname: 'Counter',
    Manager: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    User: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Guest: { Read: false, List: false, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Config',
    Manager: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    User: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Guest: { Read: false, List: false, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Comment',
    Manager: { Read: true, List: true, Add: true, Edit: true, Delete: false },
    User: { Read: true, List: true, Add: true, Edit: false, Delete: false },
    Viewer: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Guest: { Read: false, List: false, Add: true, Edit: false, Delete: false },
  },
  /*
  {
    listname: 'Post',
    Manager: { Read: true, List: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Guest: { Read: true, List: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Page',
    Manager: { Read: true, List: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Guest: { Read: true, List: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Tag',
    Manager: { Read: true, List: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, List: true, Add: false, Edit: false, Delete: false },
    Guest: { Read: true, List: true, Add: false, Edit: false, Delete: false },
  }, // */
];
