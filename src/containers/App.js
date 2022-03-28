import React, {Component} from 'react';
import CardList from '../components/CardList';
import SearchBox from '../components/SearchBox';
import Scroll from '../components/Scroll';
import './App.css'

class App extends Component{
	constructor(){
		super()
		this.state = {
			robots: [],
            searchfield: ''
		}
	}


componentDidMount(){
	fetch('https://opensheet.elk.sh/1xXSenY9pIvhPOwp3M2gcQnTUvQYjvVfPfSkJGTolE8Y/1')
	.then(response => {return response.json()})
	.then(robots =>{this.setState({robots: robots})})
	
}

onSearchChange = (event) => {
    this.setState({ searchfield: event.target.value })
  }

  render() {
    const { robots, searchfield } = this.state;
    const filteredRobots = robots.filter(robot =>{
      return robot.name.toLowerCase().includes(searchfield.toLowerCase());
    })
    return !robots.length ?
      <h1 className='tc'>Loading</h1> :
      (
        <div className='tc'>
          <h1 className='f1'>RoboFriends</h1>
          <div>
          <SearchBox searchChange={this.onSearchChange}/>
          <button className='pa3 ba br4 b--green bg-lightest-blue'><a style={{textDecoration:'none', color:'black'}} target="_blank" rel="noreferre noopener" href="https://docs.google.com/spreadsheets/d/1xXSenY9pIvhPOwp3M2gcQnTUvQYjvVfPfSkJGTolE8Y/edit?usp=sharing">Add Your Card</a></button>
          </div>
          <Scroll>
            <CardList robots={filteredRobots} />
          </Scroll>
        </div>
      );
  }
}
export default App;





