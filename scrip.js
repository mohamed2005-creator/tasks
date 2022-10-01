/*
Just messing around (proof of concept)
*/
(function ($) {
  var initialState = {
    foo: [],
    currentNoteId: null,
    notes: [
      {
        id: 1, // UUID?
        title: 'Foo!',
        text: 'Bar bar bar.'
      }
    ]
  }
  var reducers = Redux.combineReducers({notes: notes, foo: foo, currentNoteId: currentNoteId})
  var store = Redux.createStore(reducers, initialState, window.devToolsExtension && window.devToolsExtension())
  var subscription = store.subscribe(updateData)

  // success, loading, error
  
  $(function (e) {
    $(document)
      .on('submit', '#note-editor', saveNote)
      .on('click', '#delete-note', deleteNote)
      .on('click', '#edit-note', editNote)

    updateData()
  })

  function updateData () {
    var currentNote,
        currentNoteId,
        data = store.getState()
    
    // Current note? new note ?
    console.log('DATA >>', data.notes)
    
    if (data.currentNoteId) {
      currentNoteId = data.currentNoteId
    } else if (data.notes) {
      currentNoteId = data.notes.length + 1
    } else {
      currentNoteId = 1
    }
    
    console.log('currentNoteId >>>', currentNoteId)
    
    var cn = _.find(data.notes, {id: currentNoteId})
    // console.log('CN >>', cn)
    
    var currentNote = cn || {
      id: currentNoteId,
      title: '',
      text: ''
    }

    $('#root')
      .empty()
      .append(renderNoteEditor(currentNote))
      .append(renderNotes(_.sortBy(data.notes, 'id')))
  }
  
  // Reducers
  function foo (state, action) {
    var state = state || [];
    return state;
  }
  
  function currentNoteId (state, action) {
    var state = state || 0
    
    switch (action.type) {
      case 'EDIT_NOTE':
        return action.id
      default:
        return state
    }
  }

  function notes (state, action) {
    var state = state || []

    switch (action.type) {
      case 'SAVE_NOTE':
        var hasNote = _.find(state, {id: action.note.id})
        
        if (hasNote) {
          return state.filter(function (note) {
            return note.id != action.note.id
          })
          .concat([action.note])
        } else {
          return state.concat([action.note])  
        }
      case 'DELETE_NOTE':
        return state.filter(function (note) {
          return note.id !== action.id
        })
      default:
        return state
    }
  }

  // Dispatchers
  function newNote (e) {}
  
  function saveNote (e) {
    e.preventDefault()
    var $note = $('#note-editor')
    var note = {
      id: parseInt($note.find('#note-id').val(), 10),
      title: $note.find('#title').val(),
      text: $note.find('#text').val()
    }

    // If note not empty, save it
    // else show errors (dispatch error state objects)

    store.dispatch({
      type: 'SAVE_NOTE',
      note: note
    })
  }

  function editNote(e) {
    var id = $(e.target).parents('.note-content').attr('id').replace(/note-/, '')
    
    store.dispatch({
      type: 'EDIT_NOTE',
      id: parseInt(id, 10)
    })
  }
  
  function deleteNote (e) {
    var id = $(e.target).parents('.note-content').attr('id').replace(/note-/, '')

    store.dispatch({
      type: 'DELETE_NOTE',
      id: parseInt(id, 10)
    })
  }

  // Templates
  // Trying jQuery+lodash templates (based on contraints of current project)
  _.templateSettings = {
        evaluate:    /\{\{(.+?)\}\}/g,
        interpolate: /\{\{(.+?)\}\}/g,
        escape: /\{\{-(.+?)\}\}/g
    };
  
  function renderNoteEditor (data) {
    // Error info in template... some day
    var tmpl = $('#noteEditorTemplate').text()
    var template = _.template(tmpl)
    return template(data)
  }

  function renderNotes(notes, $parentEl) {
    var $notesUl = $("<ul class='notes list-unstyled'>")

    notes.forEach(function (note) {
      var $noteLi = $("<li class='note'>")
      $noteLi.append(renderNote(note))
      $notesUl.append($noteLi)
    })

    return $notesUl
  }

  function renderNote(data) {
    var tmpl = $('#noteContentTemplate').text()
    var template = _.template(tmpl)
    return template(data)
  }
})(jQuery)