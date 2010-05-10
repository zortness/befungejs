/* hello world speed test for interpreter */
document.write ('This program will run the BeFunge "Hello World!" script through the interpreter numerous times to get an average execution time.<br /><br />');
var cycles = 1000;
bfjs = new BefungeJS ();
document.write ('Executing interpreter ' + cycles + ' times...');
var startTime = new Date ();

var helloWorld = 	">              v\n" + 
				"v  ,,,,,\"Hello\"<\n" +
				">48*,          v\n" +
				"v,,,,,,\"World!\"<\n" +
				">25*,@";
for (var i = 0; i < cycles; i++)
{
	bfjs.reset ();
	bfjs.execute (helloWorld);
}
var stopTime = new Date();
var execTime = (stopTime - startTime);
var avg = (execTime / cycles);
document.write ('Done.<br />');
document.write ('Start Time: ' + startTime + '<br />');
document.write ('Stop Time: ' + stopTime + '<br />');
document.write ('Total Execution Time: ' + execTime + ' ms<br />');
document.write ('Average Execution Time: ' + avg + ' ms<br />');
document.write ('<br />Output from interpreter: <b>' + bfjs.getOutStream() + '</b><br/>');