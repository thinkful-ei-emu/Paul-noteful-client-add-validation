import React, { Component } from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import './App.css';
import { NoteContext } from '../NoteContext';
import AddFolder from '../AddFolder/AddFolder';
import AddFolderNav from '../AddFolderNav/AddFolderNav';
import AddNote from '../AddNote/AddNote'
import AddNoteNav from'../AddNoteNav/AddNoteNav';

class App extends Component {

    state = {
        deleteNote: (noteId) => {
            this.setState({
                isLoading:true
            });
            fetch(`http://localhost:9090/notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' },
            })
            .then( () => {
                this.setState({
                    notes: this.state.notes.filter( (note) => note.id !== noteId
                    ),
                    isLoading:false
                })
            })
            .catch( (e) => {
                console.log(e)
            })
        },
        addNote: (noteName,noteContent,folderId) => { 
            const noteJson=JSON.stringify({
                name: noteName,
                modified: new Date(),
                content: noteContent,
                folderId: folderId
            });
            fetch(`http://localhost:9090/notes`, {
                method: 'POST',
                body: noteJson,
                headers: { 'content-type': 'application/json' },
            })
            .then( (res) => {
                
                this.setState({
                    isLoading:true
                });
                return fetch('http://localhost:9090/notes')
            })
            .then( res=>res.json())
            .then(resJson=>{
                this.setState({
                    notes:resJson,
                    isLoading:false
                });
            })
            .catch( (e) => {
                console.log(e)
            })
        },
        addFolder: (folderName) => { 
            const folderJson = JSON.stringify({name:folderName});
            fetch(`http://localhost:9090/folders`, {
                method: 'POST',
                body: folderJson,
                headers: { 'content-type': 'application/json' },
            })
            .then( (res) => {
                
                this.setState({
                    isLoading:true
                });
                return fetch('http://localhost:9090/folders');
            })
            .then(res=>res.json())
            .then( (resFolders)=>{
                this.setState({
                    folders:resFolders,
                    isLoading:false
                });
            })
            .catch( (e) => {
                console.log(e)
            })
        },
        isLoading:true,
        notes: [],
        folders: []
    };

    componentDidMount() {
        Promise.all([fetch('http://localhost:9090/folders'),
        fetch('http://localhost:9090/notes')])
            .then(responses => {
                return Promise.all([responses[0].json(), responses[1].json()])
            })
            .then(responseJsons => {
                this.setState({
                    notes: responseJsons[1],
                    folders: responseJsons[0],
                    isLoading:false,
                }
                )
            })

    }

    renderNavRoutes() {
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => (
                            <NoteListNav
                                // folders={folders}
                                // notes={notes}
                                {...routeProps}
                                isLoading={this.state.isLoading}
                            />
                        )}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        return <NotePageNav {...routeProps} noteId={routeProps.match.params.noteId} isLoading={this.state.isLoading} />;
                    }}
                />
                <Route path="/add-folder" render={routeProps => {
                        return <AddFolderNav {...routeProps} isLoading={this.state.isLoading} />;
                    }} />
                <Route path="/add-note/:folderId" render={routeProps => {
                        return <AddNoteNav isLoading={this.state.isLoading} {...routeProps} folderId={routeProps.match.params.folderId} />;
                    }} />
                <Route exact path="/add-note" render={routeProps => {
                        return <AddNoteNav isLoading={this.state.isLoading} {...routeProps} />;
                    }} />
            </>
        );
    }

    renderMainRoutes() {
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => {
                            const { folderId } = routeProps.match.params;

                            return (
                                <NoteListMain
                                    {...routeProps}
                                    folderId={folderId}  isLoading={this.state.isLoading}
                                />
                            );
                        }}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const { noteId } = routeProps.match.params;
                        return <NotePageMain {...routeProps} noteId={noteId} isLoading={this.state.isLoading} />;
                    }}
                />
                <Route
                    path="/add-folder"
                    exact
                    render={routeProps => {
                        return <AddFolder isLoading={this.state.isLoading} {...routeProps} />;
                    }}
                />
                <Route exact path="/add-note"
                    render={routeProps => {
                        return <AddNote {...routeProps} isLoading={this.state.isLoading}  folderId={routeProps.match.params.folderId}/>;    
                    }} 
                />  
                <Route
                    path="/add-note/:folderId"
                    render={routeProps => {
                        return <AddNote {...routeProps} folderId={routeProps.match.params.folderId}isLoading={this.state.isLoading}/>;
                    }}
                />
            </>
        );
    }

    render() {
        return (
            <NoteContext.Provider value={
                this.state
            }>
                <div className="App">
                    <nav className="App__nav">
                        <Switch>
                            {this.renderNavRoutes()}
                        </Switch>
                    </nav>
                    <header className="App__header">
                        <h1>
                            <Link to="/">Noteful</Link>{' '}
                            <FontAwesomeIcon icon="check-double" />
                        </h1>
                    </header>
                    <main className="App__main">
                        <Switch>
                            {this.renderMainRoutes()}
                        </Switch>
                    </main>
                </div>
            </NoteContext.Provider>
        );
    }
}

export default App;
